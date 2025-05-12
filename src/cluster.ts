import cluster from 'cluster';
import { cpus } from 'os';
import http from 'http';
import { handleWorkerMessage } from './ipc/shareDB';

const numCPUs = cpus().length - 1;
const BASE_PORT = parseInt(process.env.PORT || '4000', 10);

if (cluster.isPrimary) {
  const workerPorts: number[] = [];

  for (let i = 1; i <= numCPUs; i++) {
    const port = BASE_PORT + i;
    const worker = cluster.fork({ ...process.env, WORKER_PORT: port.toString() });
    workerPorts.push(port);
    worker.on('message', (msg) => handleWorkerMessage(msg, worker));
  }

  let current = 0;
  const server = http.createServer((req, res) => {
    const targetPort = workerPorts[current];
    current = (current + 1) % workerPorts.length;

    const proxyReq = http.request(
      {
        hostname: 'localhost',
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        const code = proxyRes.statusCode;
        if (code) {
          res.writeHead(code, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        }
      },
    );

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500);
      res.end('Internal Server Error');
    });

    req.pipe(proxyReq, { end: true });
  });

  server.listen(BASE_PORT, () => {
    console.log(`Load balancer listening at http://localhost:${BASE_PORT}`);
  });
} else {
  import('./server');
}
