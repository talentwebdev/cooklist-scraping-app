import { render } from "@testing-library/react-native";
import React from "react";
import App from "./App";
import { WebViewEventTriggers } from "./__mocks__/WebView";
import { MessageTypes } from "./services/base.service";

describe("App", () => {
  let log: any;

  beforeEach(() => {
    log = jest.spyOn(console, "log").mockImplementation(() => {});

    fetch = jest.fn().mockImplementationOnce(() => {
      return new Promise((resolve, reject) => {
        resolve({
          ok: true,
          json: () => {
            return {};
          },
          text: () => {
            console.log("response");
            return "{}";
          },
        });
      });
    });
  });

  fit("Logged In and Logged Out Event", () => {
    render(<App />);

    // logged in event
    WebViewEventTriggers.onMessage &&
      WebViewEventTriggers.onMessage({
        nativeEvent: { data: JSON.stringify({ type: MessageTypes.loggedIn }) },
      });

    expect(log).toHaveBeenCalledWith("# LOGGED IN #");

    // logged in event
    WebViewEventTriggers.onMessage &&
      WebViewEventTriggers.onMessage({
        nativeEvent: { data: JSON.stringify({ type: MessageTypes.loggedOut }) },
      });

    expect(log).toHaveBeenCalledWith("# LOGGED OUT #");
  });

  fit("Intercept /orders and make fetch request", async () => {
    const cookie: string = "cookie";

    render(<App />);

    // logged in event
    WebViewEventTriggers.onMessage &&
      WebViewEventTriggers.onMessage({
        nativeEvent: {
          data: JSON.stringify({
            type: MessageTypes.ordersResponse,
            data: {
              cookie,
              url: "/purchase-history",
              headers: {},
              data: {},
            },
          }),
        },
      });

    expect(log).toHaveBeenCalledWith("# ORDERS LIST #");
    expect(fetch).toHaveBeenCalled();
  });
});
