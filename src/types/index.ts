export interface RegistrationFormData {
  username: string;
  password: string;
  birthday: Date;
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

export interface CreateShareFormData {
  privacy: string;
  content: string;
}

export interface CreateShareError {
  content?: string[];
  privacy?: string[];
}

export interface CreateMessageInConversationFormData {
  content?: string;
}

export type CreateMessageInConversationError = {
  [P in keyof CreateMessageInConversationFormData]: CreateMessageInConversationFormData[P][];
};
