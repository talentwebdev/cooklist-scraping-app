export enum MessageTypes {
  ordersResponse = "ordersResponse",
  loggedIn = "loggedIn",
  loggedOut = "loggedOut",
}

export interface IMessage {
  type: MessageTypes;
  data: any;
}

export interface IRequestHeaders {
  [key: string]: string;
}

export type MessageHandler = (message: IMessage) => void;


export abstract class BaseService {
  public authenticatedHeaders?: IRequestHeaders;
  public messageHandler?: MessageHandler;

  constructor() {
    this.onMessage = this.onMessage.bind(this);
    this.getOrders = this.getOrders.bind(this);
  }

  public setMessageHandler(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  abstract onMessage(message: any): void;
  abstract getSDKCode(): string;
  abstract getOrders(): Promise<void>;
}
