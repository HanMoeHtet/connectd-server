import { model, Schema } from '@src/config/database.config';
import { Document } from 'mongoose';

export interface PhoneNumberVerificationData {
  userId: string;
  hash: string;
  createdAt: Date;
}

const PhoneNumberVerificationSchema = new Schema<PhoneNumberVerificationData>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  hash: {
    type: String,
    requiered: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PhoneNumberVerification = model<PhoneNumberVerificationData>(
  'PhoneNumberVerification',
  PhoneNumberVerificationSchema,
  'phone_number_verifications'
);

export type PhoneNumberVerification = PhoneNumberVerificationData &
  Document<any, any, PhoneNumberVerificationData>;

export default PhoneNumberVerification;
