import EmailVerification from '@src/models/EmailVerification';
import { UnverifiedUserDocument } from '@src/models/UnverifiedUser';
import { sign } from 'jsonwebtoken';
import { createTransport } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

const auth = {
  user: process.env.EMAIL,
  pass: process.env.EMAIL_PASSWORD,
};

const transporter = createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth,
});

const sendMail = async ({ to, subject, html }: MailOptions) => {
  try {
    await transporter.sendMail({
      from: auth.user,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Sending mail error:', err);
    throw err;
  }
};

const getHTMLForVerificationMail = (
  verificationMailEndPoint: string,
  username: string
) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm your email</title>
  </head>
  <body>
    <div style="font-family: sans-serif; border: 1px solid gray; padding: 15px; width: 75%; border-radius: 7px;">
      <h1 style="color: blue;">Confirm your email address</h1>
      <p>Hello ${username},</p>
      <p>Thanks for signing up for ${process.env.APP_NAME}. To use your account, you'll first need to confirm your email via
        button below.
      </p>
      <a href="${verificationMailEndPoint}"
        style="text-decoration: none; background-color: blue; color: white; padding: 10px; border-radius: 5px;">
        Confirm your email
      </a>
      <p>Thanks,</p>
      <p>${process.env.APP_NAME}</p>
    </div>
  </body>
  </html>`;
};

export const sendVerificationMail = async (user: UnverifiedUserDocument) => {
  const emailVerification = new EmailVerification({
    userId: user.id,
  });

  await emailVerification.save();

  const token = sign({ userId: user.id }, process.env.APP_SECRET!);
  const emailVerificationEndpoint = `${process.env.EMAILL_VERIFICATION_END_POINT}?token=${token}`;

  const subject = 'Confirm your email';
  const html = getHTMLForVerificationMail(
    emailVerificationEndpoint,
    user.username
  );

  await sendMail({ to: user.email, subject, html });
};
