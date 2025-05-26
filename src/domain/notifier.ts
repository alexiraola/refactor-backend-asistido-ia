export interface Notifier {
  notify(message: string): Promise<void>;
}

export class FakeNotifier implements Notifier {
  async notify(_message: string) {
  }
}
