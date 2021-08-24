import checkAuth from '@src/ws/middlewares/check-auth.middleware';
import { AuthSocket } from '@src/types/ws';
import io from '@src/config/ws.config';

io.use(checkAuth);

io.on('connection', (socket: AuthSocket) => {
  socket.join(String(socket.data.user._id));
});

export default io;
