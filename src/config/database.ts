import mongoose from 'mongoose';
import { register } from '@src/resources/register';

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('DB connected');
});

mongoose.set('debug', true);

export const init = async () => {
  console.log(process.env.MONGODB_URL);
  await mongoose.connect(process.env.MONGODB_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await register();
  console.log(db.models);
};

export const { Schema, model } = mongoose;

export default db;
