import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@riftbound/shared";

const fallbackServerUrl = import.meta.env.DEV
  ? `${window.location.protocol}//${window.location.hostname}:3001`
  : window.location.origin;
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_SERVER_URL || fallbackServerUrl,
  { autoConnect: true }
);
