import { model, Schema } from '@src/config/database';
import { Post as PostType, Privacy } from '@src/types/Post';

const PostSchema = new Schema<PostType>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  privacy: {
    type: Number,
    enum: Object.values(Privacy),
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  reactionIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Reaction',
    },
  ],
  commentIds: [
    {
      type: [Schema.Types.ObjectId],
      ref: 'Comment',
    },
  ],
  shareIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Share',
    },
  ],
});

const Post = model<PostType>('Post', PostSchema);

export default Post;
