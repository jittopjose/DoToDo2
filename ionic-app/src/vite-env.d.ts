/// <reference types="vite/client" />

interface Window {
  qt?: { webChannelTransport: unknown };
  QWebChannel?: new (
    transport: unknown,
    callback: (channel: { objects: Record<string, unknown> }) => void,
  ) => void;
}
