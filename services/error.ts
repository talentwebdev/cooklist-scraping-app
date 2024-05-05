export enum ErrorCodes {
  apiResponseError = 0,
  unauthorizedError = 1,
}

export abstract class ErrorBase extends Error {
  abstract errorCode: number;
  public data: any;

  constructor(msg: string, data?: any) {
    super(msg);
    this.data = data;
  }

  public renderError() {
    console.log(this.message, this.data);
  }
}

export class APIResponseError extends ErrorBase {
  errorCode = ErrorCodes.apiResponseError;
}

export class UnAuthorizedError extends ErrorBase {
  errorCode = ErrorCodes.unauthorizedError;
}
