import { BCRYPT_ROUNDS, OTP_LENGTH } from '@src/constants';
import { UserDocument } from '@src/resources/user/user.model';
import Twilio from 'twilio';
import { hash } from 'bcrypt';
import PhoneNumberVerification from '@src/resources/phone-number-verification/phone-number-verification.model';
import { UnverifiedUserDocument } from '@src/resources/unverified-user/unverified-user.model';

const accountSid =
  process.env.TWILIO_ACCOUNT_SID! || 'ACc0ce95d9a202822f2e835203dc906bc4';
const authToken =
  process.env.TWILIO_AUTH_TOKEN! || '60b7e9133b843e26e9127337f5a171b0';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;
const appName = process.env.APP_NAME!;

const client = Twilio(accountSid, authToken);

export const validatePhoneNumber = async (
  phoneNumber: string
): Promise<boolean> => {
  try {
    await client.lookups.v1.phoneNumbers(phoneNumber).fetch();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const sendSMS = async (to: string, message: string) => {
  try {
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getOTPMessageTemplate = (otp: string) => {
  return `
    Your activation code for ${appName} is: ${otp}
  `;
};

export const sendOTP = async (user: UnverifiedUserDocument) => {
  const otp = Array(OTP_LENGTH)
    .fill(0)
    .map((_) => Math.floor(Math.random() * 10))
    .join('');

  const hashedOTP = await hash(otp, BCRYPT_ROUNDS);

  const phoneNumberVerification = new PhoneNumberVerification({
    userId: user._id,
    hash: hashedOTP,
  });

  await phoneNumberVerification.save();

  await sendSMS(user.phoneNumber!, getOTPMessageTemplate(otp));
};
