import { Server } from 'socket.io';
import { server as httpServer } from './app.config';

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN!,
  },
});

export default io;
