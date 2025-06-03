import { Future } from "./common/future";

export interface Notifier {
  notifyFuture(message: string): Future<void>;
}
