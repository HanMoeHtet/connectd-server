import * as EmailRegisterController from '@src/controllers/EmailRegisterController';
import * as EmailVerificationController from '@src/controllers/EmailVerificationController';
import * as EmailLoginController from '@src/controllers/EmailLoginController';
import * as PhoneNumberRegisterController from '@src/controllers/PhoneNumberRegisterController';
import * as PhoneNumberVerificationController from '@src/controllers/PhoneNumberVerificationController';
import * as PhoneNumberLoginController from '@src/controllers/PhoneNumberLoginController';
import { Router } from 'express';

const router = Router();

router.post('/register/email', EmailRegisterController.register);
router.post('/verify/email', EmailVerificationController.verify);
router.post('/resend/email', EmailVerificationController.resend);
router.post('/login/email', EmailLoginController.logIn);

router.post('/register/phone-number', PhoneNumberRegisterController.register);
router.post('/verify/phone-number', PhoneNumberVerificationController.verify);
router.post('/resend/phone-number', PhoneNumberVerificationController.resend);
router.post('/login/phone-number', PhoneNumberLoginController.logIn);

export default router;
