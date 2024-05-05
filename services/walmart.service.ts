import { BaseService, IMessage, MessageTypes } from "./base.service";
import { APIResponseError, ErrorBase, UnAuthorizedError } from "./error";

export class WalmartService extends BaseService {
  private ordersUrl: string = "";

  constructor() {
    super();
  }

  public getSDKCode(): string {
    return `(function (fetch) {
        if (window.injected) {
            return;
        }

        function getCookie(name) {
            const value = '; ' + document.cookie;
            const parts = value.split('; ' + name + '=');
            if (parts.length === 2) return parts.pop().split(';').shift();
        }

        window.ReactNativeWebView.postMessage(JSON.stringify({ title: 'pageLoaded', pathname: location.pathname }));
        if (getCookie('CID') && location.pathname === '/') {
            location.href = '/orders';
        }

        cookieStore.addEventListener('change', ({changed, deleted}) => {
            for (const {name, value} of changed) {
                if (name === 'CID') {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'loggedIn' }));
                }
            }

            for (const {name, value} of deleted) {
                if (name === 'CID') {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'loggedOut' }));
                }
            }
        });

        window.fetch = function() {
            var args = arguments;
            if (args[0].includes('orchestra/cph/graphql/PurchaseHistory/')) {
              return fetch.apply(this, args).then(function(response) {
                if (response.ok) {
                  return response.clone().text().then(function(data) {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'ordersResponse', data: { data, headers: args[1].headers, cookie: document.cookie, url: args[0] } }));
                    return response;
                  });
                }
                return response;
              });
            }
            return fetch.apply(this, args);
        };

        window.injected = true;
      })(window.fetch);`;
  }

  public onMessage(message: any): void {
    try {
      const messageObj: IMessage = JSON.parse(message.nativeEvent.data);
      if (messageObj.type === MessageTypes.ordersResponse) {
        this.authenticatedHeaders = {
          cookie: messageObj.data.cookie,
          "x-o-platform-version":
            messageObj.data.headers["x-o-platform-version"],
          "x-o-platform": messageObj.data.headers["x-o-platform"],
          "x-o-segment": messageObj.data.headers["x-o-segment"],
        };
        this.ordersUrl = messageObj.data.url;
      }
      this.messageHandler && this.messageHandler(messageObj);
    } catch (e) {}
  }

  public validateResponse(data: any): ErrorBase | null {
    if (
      data?.errors &&
      data?.errors.length > 0 &&
      data?.errors[0]?.message?.includes("UNAUTHENTICATED")
    ) {
      return new UnAuthorizedError('UNAUTHENTICATED error', data);
    }
    return null;
  }

  public getOrders(): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(`https://walmart.com${this.ordersUrl}`, {
        method: "GET",
        headers: {
          ...this.authenticatedHeaders,
          "X-Apollo-Operation-Name": "PurchaseHistory",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }

          reject(new APIResponseError("Unexpected Response Error", response));
        })
        .then((data: any): void => {
          console.log("Order info", data);

          const error: ErrorBase | null = this.validateResponse(data);
          if (!error) {
            return resolve(data);
          }

          reject(error);
        })
        .catch((error) => {
          console.log("error", error);
          reject(error);
        });
    });
  }
}

export const walmartService: WalmartService = new WalmartService();
