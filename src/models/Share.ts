import { model, Schema } from '@src/config/database';
import { Document } from 'mongoose';

export interface Share {
  userId: string;
  createdAt: Date;
}

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

export const ShareModel = model<Share>('Share', ShareSchema);

export type ShareDocument = Share & Document<any, any, Share>;

export default ShareModel;
