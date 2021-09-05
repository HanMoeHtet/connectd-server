import { model, Schema } from '@src/config/database.config';
import { Document, Types } from 'mongoose';

export interface EmailVerificationData {
  userId: string;
  createdAt: Date;
}

const EmailVerificationSchema = new Schema<EmailVerificationData>({
  userId: {
    type: Types.ObjectId,
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
