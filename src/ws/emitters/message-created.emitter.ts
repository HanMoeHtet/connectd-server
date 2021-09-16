import io from '@src/ws';

export const NAME = 'message-created';

export interface EmitMessageCreatedPayload {
  message: {
    _id: string;
    conversationId: string;
    content: string;
    fromUser: {
      _id: string;
      username: string;
      avatar?: string;
    };
    createdAt: Date;
  };
}
export const emitMessageCreated = (payload: EmitMessageCreatedPayload) => {
  io.to(payload.message.conversationId).emit(NAME, payload);
};
