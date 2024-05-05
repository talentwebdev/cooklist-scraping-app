export interface IWebViewEventTriggers {
  onMessage?: (message: any) => void;
}

export let WebViewEventTriggers: IWebViewEventTriggers = {};

export function WebView({ onMessage }: any) {
  WebViewEventTriggers.onMessage = onMessage;
  return null;
}
