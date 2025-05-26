import { Notifier } from "../domain/notifier";
import sgMail from '@sendgrid/mail';

export class SendGridNotifier implements Notifier {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async notify(message: string) {
    const msg = {
      to: 'alex.iraola@gmail.com', // Change to your recipient
      from: 'alex.iraola@gmail.com', // Change to your verified sender
      subject: 'Notification from Orders Service',
      text: message,
      html: `<strong>${message}</strong>`,
    };

    await sgMail.send(msg);
  }
}
