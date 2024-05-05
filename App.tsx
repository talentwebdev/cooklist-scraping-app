import React, { useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { walmartService } from "./services/walmart.service";
import { IMessage, MessageTypes } from "./services/base.service";
import { ErrorBase, ErrorCodes } from "./services/error";

export default function App() {
  const onMessage = useCallback(async (message: IMessage) => {
    switch (message.type) {
      case MessageTypes.ordersResponse: {
        console.log("# ORDERS LIST #");
        console.log(message.data.data);

        try {
          await walmartService.getOrders();
        } catch (e) {
          if (e instanceof ErrorBase) {
            switch (e.errorCode) {
              case ErrorCodes.unauthorizedError: {
                console.error("Unauthorized Error", e.message, e.data);
                break;
              }
              case ErrorCodes.apiResponseError: {
                console.error("API Response Error", e.message, e.data);
                break;
              }
              default: {
                break;
              }
            }
          }
        }

        console.log("# END OF ORDER LIST #");
        break;
      }
      case MessageTypes.loggedIn: {
        console.log("# LOGGED IN #");
        break;
      }
      case MessageTypes.loggedOut: {
        console.log("# LOGGED OUT #");
        break;
      }
      default: {
        break;
      }
    }
  }, []);

  useEffect(() => {
    walmartService.setMessageHandler(onMessage);
  }, [onMessage]);

  return (
    <WebView
      style={styles.container}
      source={{ uri: "https://walmart.com" }}
      onMessage={walmartService.onMessage}
      injectedJavaScript={walmartService.getSDKCode()}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
