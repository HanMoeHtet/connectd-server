import { model, Schema } from '@src/config/database';
import { ReactionType, Reaction } from '@src/types/Post';

const ReactionSchema = new Schema<Reaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: Number,
    enum: Object.values(ReactionType),
    requred: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Reaction = model<Reaction>('Reaction', ReactionSchema);

export default Reaction;
