import Debugger from 'debug';
import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

const app = express();
const debug = Debugger('app:server');

app.use(cors({ origin: process.env.CLIENT_ORIGIN! }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static('public'));

const normalizePort = (val: string) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

const port = normalizePort(process.env.PORT || '8000');
app.set('port', port);

const onError = (error: any) => {
  if (error.syscall !== 'listen') throw error;

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address()!;
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
  console.log(`Server listening at http://localhost:${port}`);
};

export const server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);

export const init = () => {
  server.listen(port);
};

export default app;
