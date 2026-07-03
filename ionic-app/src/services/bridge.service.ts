interface QmlBackend {
  log: (msg: string) => void;
}

let backend: QmlBackend | null = null;
let initPromise: Promise<void> | null = null;

function connect(resolve: () => void) {
  const QWebChannel = window.QWebChannel!;
  new QWebChannel(
    window.qt!.webChannelTransport,
    (ch) => {
      backend = ch.objects.backend as QmlBackend;
      resolve();
    },
  );
}

export async function initBridge(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = new Promise((resolve) => {
    if (typeof window.qt?.webChannelTransport === 'undefined') {
      resolve();
      return;
    }
    if (typeof window.QWebChannel !== 'undefined') {
      connect(resolve);
      return;
    }
    const s = document.createElement('script');
    s.src = 'qrc:///qtwebchannel/qwebchannel.js';
    s.onload = () => connect(resolve);
    document.head.appendChild(s);
  });
  return initPromise;
}

export function getBackend(): QmlBackend | null {
  return backend;
}

export function isBridgeReady(): boolean {
  return backend !== null;
}
