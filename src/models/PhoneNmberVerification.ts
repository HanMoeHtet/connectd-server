import { model, Schema } from '@src/config/database';
import { PhoneNumberVerificationData } from '@src/types';
import { Document } from 'mongoose';

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
