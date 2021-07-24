import * as EmailRegisterController from '@src/controllers/EmailRegisterController';
import * as EmailVerificationController from '@src/controllers/EmailVerificationController';
import * as PhoneNumberRegisterController from '@src/controllers/PhoneNumberRegisterController';
import * as PhoneNumberVerificationController from '@src/controllers/PhoneNumberVerificationController';
import { Router } from 'express';

const router = Router();

router.post('/register/email', EmailRegisterController.register);
router.post('/verify/email', EmailVerificationController.verify);
router.post('/resend/email', EmailVerificationController.resend);

router.post('/register/phone_number', PhoneNumberRegisterController.register);
router.post('/verify/phone_number', PhoneNumberVerificationController.verify);
router.post('/resend/phone_number', PhoneNumberVerificationController.resend);

export default router;
