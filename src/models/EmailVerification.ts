import { model, Schema } from '@src/config/database';
import { EmailVerificationData } from '@src/types';
import { Document } from 'mongoose';

const EmailVerificationSchema = new Schema<EmailVerificationData>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EmailVerification = model<EmailVerificationData>(
  'EmailVerification',
  EmailVerificationSchema,
  'email_verifications'
);

export type EmailVerification = EmailVerificationData &
  Document<any, any, EmailVerificationData>;

export default EmailVerification;
