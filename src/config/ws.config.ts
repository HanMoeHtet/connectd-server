import { Server } from 'socket.io';
import { server as httpServer } from './app.config';
import { AuthSocket } from '@src/types/ws';
import checkAuth from '@src/ws/middlewares/check-auth.middleware';

const io = new Server(httpServer);

// io.use(checkAuth);

io.on('connection', (socket: AuthSocket) => {
  console.log('hello world');
  console.log(socket.data.user);

  socket.on('message', (text) => {
    console.log(text);
  });

  socket.emit('message', 'hello');
});

export default io;
