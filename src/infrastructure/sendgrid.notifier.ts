import { Future } from "../domain/common/future";
import { Notifier } from "../domain/notifier";
import sgMail from '@sendgrid/mail';

export class SendGridNotifier implements Notifier {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  notify(message: string): Future<void> {
    return Future.fromPromise(new Promise<void>((resolve, reject) => {
      const msg = {
        to: 'alex.iraola@gmail.com', // Change to your recipient
        from: 'alex.iraola@gmail.com', // Change to your verified sender
        subject: 'Notification from Orders Service',
        text: message,
        html: `<strong>${message}</strong>`,
      };

      sgMail.send(msg).then(() => resolve()).catch(() => reject());
    }));
  }
}
