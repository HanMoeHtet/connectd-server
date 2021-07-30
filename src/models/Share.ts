import { model, Schema } from '@src/config/database';
import { Share } from '@src/types/Post';

const ShareSchema = new Schema<Share>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Share = model<Share>('Share', ShareSchema);

export default Share;
