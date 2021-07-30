import { model, Schema } from '@src/config/database';
import { Reply } from '@src/types/Post';

export const ReplySchema = new Schema<Reply>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    requred: true,
  },
  reactionIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Reaction',
    },
  ],
});

const Reply = model<Reply>('Reply', ReplySchema);

export default Reply;
