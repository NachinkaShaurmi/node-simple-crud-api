import dotenv from 'dotenv';
import { env } from 'node:process';
import { createServer } from 'http';
import router from './router';

dotenv.config();

const PORT = parseInt(env.WORKER_PORT || env.PORT || '4000', 10);

const server = createServer(async (req, res) => {
  try {
    console.log(`Request received on port ${PORT}`);

    await router(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'error', message: 'Internal Server Error' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default server;
