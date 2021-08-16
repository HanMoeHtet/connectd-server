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
  userId?: string;
}

export interface AuthTokenPayload {
  userId?: string;
}

export interface CreatePostFormData {
  privacy: string;
  content: string;
}

export interface CreatePostError {
  content?: string[];
  privacy?: string[];
}

export interface CreateCommentFormData {
  content: string;
}

export interface CreateCommentError {
  content?: string[];
}

export interface CreateReplyFormData {
  content: string;
}

export interface CreateReplyError {
  content?: string[];
}
