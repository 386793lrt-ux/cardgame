type LogLevel = "debug" | "info" | "warn" | "error";
type SafeContext = Record<string, string | number | boolean | undefined>;

const rank: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export class Logger {
  constructor(private readonly minimumLevel: LogLevel) {}

  debug(message: string, context: SafeContext = {}): void { this.write("debug", message, context); }
  info(message: string, context: SafeContext = {}): void { this.write("info", message, context); }
  warn(message: string, context: SafeContext = {}): void { this.write("warn", message, context); }
  error(message: string, context: SafeContext = {}): void { this.write("error", message, context); }

  private write(level: LogLevel, message: string, context: SafeContext): void {
    if (rank[level] < rank[this.minimumLevel]) return;
    const entry = JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...context });
    if (level === "error") console.error(entry);
    else if (level === "warn") console.warn(entry);
    else console.log(entry);
  }
}
