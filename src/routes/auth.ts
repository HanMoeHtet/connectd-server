import * as EmailRegisterController from '@src/http/controllers/email-register.controller';
import * as EmailVerificationController from '@src/http/controllers/email-verification.controller';
import * as EmailLoginController from '@src/http/controllers/email-login.controller';
import * as PhoneNumberRegisterController from '@src/http/controllers/phone-number-register.controller';
import * as PhoneNumberVerificationController from '@src/http/controllers/phone-number-verification.contorller';
import * as PhoneNumberLoginController from '@src/http/controllers/phone-number-login.controller';
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
