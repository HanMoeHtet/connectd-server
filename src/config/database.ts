import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URL!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('DB connected');
});

export const { Schema, model } = mongoose;
