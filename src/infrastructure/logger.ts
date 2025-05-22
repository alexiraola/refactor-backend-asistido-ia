export interface Logger {
  log(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}

export class ConsoleLogger implements Logger {
  log(message?: any, ...optionalParams: any[]): void {
    console.log(message, optionalParams);
  }
  error(message?: any, ...optionalParams: any[]): void {
    console.error(message, optionalParams);
  }
}

export class NoopLogger implements Logger {
  log(_message?: any, ..._optionalParams: any[]): void {
    // do nothing
  }
  error(_message?: any, ..._optionalParams: any[]): void {
    // do nothing
  }
}
