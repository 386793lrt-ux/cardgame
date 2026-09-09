using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace RiftboundLauncher
{
    internal sealed class LauncherForm : Form
    {
        private const string GameUrl = "http://localhost:5173";
        private const string HealthUrl = "http://127.0.0.1:3001/health";
        private const string FrontendUrl = "http://127.0.0.1:5173";
        private readonly Label statusLabel;
        private readonly Button openButton;
        private readonly string projectRoot;
        private Process serverProcess;
        private bool ownsServer;
        private bool closing;

        public LauncherForm()
        {
            Text = "裂隙牌局启动器";
            Width = 470;
            Height = 250;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.FromArgb(20, 21, 25);
            ForeColor = Color.FromArgb(236, 227, 207);
            Font = new Font("Microsoft YaHei UI", 10F);

            var title = new Label { Text = "✦  裂隙牌局", AutoSize = false, TextAlign = ContentAlignment.MiddleCenter, Font = new Font("Microsoft YaHei UI", 22F, FontStyle.Bold), ForeColor = Color.FromArgb(232, 197, 119), Left = 20, Top = 22, Width = 414, Height = 48 };
            statusLabel = new Label { Text = "正在准备本地游戏……", AutoSize = false, TextAlign = ContentAlignment.MiddleCenter, Left = 25, Top = 82, Width = 404, Height = 45 };
            openButton = new Button { Text = "打开游戏", Left = 86, Top = 143, Width = 130, Height = 38, Enabled = false, BackColor = Color.FromArgb(95, 72, 32), FlatStyle = FlatStyle.Flat };
            var exitButton = new Button { Text = "关闭", Left = 238, Top = 143, Width = 130, Height = 38, BackColor = Color.FromArgb(48, 50, 57), FlatStyle = FlatStyle.Flat };
            openButton.Click += delegate { OpenGame(); };
            exitButton.Click += delegate { Close(); };
            Controls.Add(title); Controls.Add(statusLabel); Controls.Add(openButton); Controls.Add(exitButton);

            projectRoot = FindProjectRoot();
            Shown += async delegate { await StartGameAsync(); };
            FormClosing += OnLauncherClosing;
        }

        private static string FindProjectRoot()
        {
            var current = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory);
            for (var depth = 0; depth < 4 && current != null; depth += 1, current = current.Parent)
            {
                if (File.Exists(Path.Combine(current.FullName, "package.json"))) return current.FullName;
            }
            return null;
        }

        private async Task StartGameAsync()
        {
            try
            {
                if (await AreGameServicesHealthyAsync()) { Ready("游戏服务已经运行。", true); return; }
                if (IsPortOccupied(3001)) throw new InvalidOperationException("后端端口 3001 已被其他程序占用，请先关闭占用该端口的程序。");
                if (IsPortOccupied(5173)) throw new InvalidOperationException("前端端口 5173 已被其他程序占用，请先关闭占用该端口的程序。");
                if (projectRoot == null) throw new FileNotFoundException("找不到 CardGame 项目目录。请把 EXE 保留在项目的 release 文件夹中。");
                if (!File.Exists(Path.Combine(projectRoot, "apps", "server", "package.json")) || !File.Exists(Path.Combine(projectRoot, "client", "package.json")))
                    throw new FileNotFoundException("缺少前端或后端项目文件，请确认游戏目录完整。");
                if (!CommandAvailable("node.exe", "--version") || !CommandAvailable("cmd.exe", "/d /s /c \"npm --version\""))
                    throw new InvalidOperationException("没有找到 Node.js/npm。请从 Node.js 官方网站安装项目要求的 Node.js LTS。");

                statusLabel.Text = "正在启动前端（5173）和后端（3001）……";
                var startInfo = new ProcessStartInfo("cmd.exe", "/d /s /c \"npm run dev\"");
                startInfo.WorkingDirectory = projectRoot;
                startInfo.UseShellExecute = false;
                startInfo.CreateNoWindow = true;
                startInfo.RedirectStandardOutput = true;
                startInfo.RedirectStandardError = true;
                serverProcess = Process.Start(startInfo);
                if (serverProcess == null) throw new InvalidOperationException("无法创建游戏服务进程。");
                ownsServer = true;
                serverProcess.BeginOutputReadLine();
                serverProcess.BeginErrorReadLine();

                for (var attempt = 0; attempt < 80; attempt += 1)
                {
                    if (serverProcess.HasExited) throw new InvalidOperationException("本地游戏服务启动失败，进程已提前退出。请确认已经安装项目依赖。");
                    if (await AreGameServicesHealthyAsync()) { Ready("游戏已启动：前端 5173，后端 3001。关闭此窗口将同时关闭本地服务。", true); return; }
                    await Task.Delay(250);
                }
                throw new TimeoutException("等待前端或后端启动超时。");
            }
            catch (Exception error)
            {
                WriteDiagnostic(error.ToString());
                StopOwnedServer();
                statusLabel.Text = "启动失败";
                MessageBox.Show(this, error.Message, "裂隙牌局启动失败", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static void WriteDiagnostic(string message)
        {
            try { File.AppendAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "launcher-error.log"), DateTime.Now.ToString("s") + " " + message + Environment.NewLine); }
            catch { }
        }

        private void Ready(string message, bool openBrowser)
        {
            statusLabel.Text = message;
            openButton.Enabled = true;
            if (openBrowser && Environment.GetEnvironmentVariable("CARDGAME_LAUNCHER_NO_BROWSER") != "1") OpenGame();
        }

        private static bool CommandAvailable(string file, string arguments)
        {
            try
            {
                var info = new ProcessStartInfo(file, arguments) { UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true };
                using (var process = Process.Start(info)) { return process != null && process.WaitForExit(5000) && process.ExitCode == 0; }
            }
            catch { return false; }
        }

        private static bool IsPortOccupied(int port)
        {
            try { using (var client = new TcpClient()) { var result = client.BeginConnect(IPAddress.Loopback, port, null, null); return result.AsyncWaitHandle.WaitOne(200) && client.Connected; } }
            catch { return false; }
        }

        private static async Task<bool> IsCardGameHealthyAsync()
        {
            try
            {
                var request = (HttpWebRequest)WebRequest.Create(HealthUrl);
                request.Timeout = 600;
                using (var response = (HttpWebResponse)await request.GetResponseAsync())
                using (var reader = new StreamReader(response.GetResponseStream()))
                    return response.StatusCode == HttpStatusCode.OK && (await reader.ReadToEndAsync()).Contains("riftbound-server");
            }
            catch { return false; }
        }

        private static async Task<bool> IsFrontendHealthyAsync()
        {
            try
            {
                var request = (HttpWebRequest)WebRequest.Create(FrontendUrl);
                request.Timeout = 600;
                using (var response = (HttpWebResponse)await request.GetResponseAsync())
                using (var reader = new StreamReader(response.GetResponseStream()))
                    return response.StatusCode == HttpStatusCode.OK && (await reader.ReadToEndAsync()).Contains("id=\"root\"");
            }
            catch { return false; }
        }

        private static async Task<bool> AreGameServicesHealthyAsync()
        {
            return await IsCardGameHealthyAsync() && await IsFrontendHealthyAsync();
        }

        private static void OpenGame()
        {
            try { Process.Start(new ProcessStartInfo(GameUrl) { UseShellExecute = true }); }
            catch (Exception error) { MessageBox.Show("无法打开默认浏览器：" + error.Message, "裂隙牌局", MessageBoxButtons.OK, MessageBoxIcon.Warning); }
        }

        private void OnLauncherClosing(object sender, FormClosingEventArgs eventArgs)
        {
            if (closing) return;
            closing = true;
            StopOwnedServer();
        }

        private void StopOwnedServer()
        {
            if (!ownsServer || serverProcess == null) return;
            try
            {
                if (!serverProcess.HasExited)
                {
                    var info = new ProcessStartInfo("taskkill.exe", "/PID " + serverProcess.Id + " /T /F") { UseShellExecute = false, CreateNoWindow = true };
                    using (var killer = Process.Start(info)) { if (killer != null) killer.WaitForExit(5000); }
                }
            }
            catch { }
            ownsServer = false;
        }
    }

    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new LauncherForm());
        }
    }
}
