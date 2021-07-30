import { model, Schema } from '@src/config/database';
import { Comment } from '@src/types/Post';
import { ReplySchema } from './Reply';

const CommentSchema = new Schema<Comment>({
  ...ReplySchema.obj,
  replyIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Reply',
    },
  ],
});

const Comment = model<Comment>('Comment', CommentSchema);

export default Comment;
