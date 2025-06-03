import { Future } from "./common/future";

export interface Notifier {
  notify(message: string): Future<void>;
}
