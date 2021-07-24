export interface UserData {
  username: string;
  email?: string;
  emailVerifiedAt?: Date;
  phoneNumber?: string;
  phoneNumberVerifiedAt?: Date;
  hashedPassword: string;
  birthday: Date;
  pronouns: Pronouns;
}

export interface EmailVerificationData {
  userId: string;
  createdAt: Date;
}

export interface PhoneNumberVerificationData {
  userId: string;
  hash: string;
  createdAt: Date;
}

export interface Pronouns {
  subjective: string;
  objective: string;
  possessive: string;
}

export interface RegistrationFormData {
  username: string;
  password: string;
  birthday: Date;
  pronouns: Pronouns;
}

export interface EmailRegistrationFormData extends RegistrationFormData {
  email: string;
}

export interface PhoneNumberRegistrationFormData extends RegistrationFormData {
  phoneNumber: string;
}

export interface RegistrationError {
  username?: string[];
  email?: string[];
  phoneNumber?: string[];
  password?: string[];
  birthday?: string[];
  pronouns?: string[];
}

export interface EmailVerificationTokenPayload {
  userId: string;
}
