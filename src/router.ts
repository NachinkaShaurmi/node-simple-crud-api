import { IncomingMessage, ServerResponse } from 'http';
import usersController from './api/user/usersController';
import { IPayload } from 'api/user/types';

const controllersMap: Record<string, (payload: IPayload, res: ServerResponse) => void> = {
  users: usersController,
};

const parseBody = async (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
};

export default async (req: IncomingMessage, res: ServerResponse) => {
  const urlArray = req.url?.split('/');

  if (urlArray && urlArray[1] === 'api') {
    const controllerName = urlArray[2];
    const controller = controllersMap[controllerName];

    const method = req.method;
    const id = urlArray[3];
    let body = null;

    if (method === 'POST' || method === 'PUT') {
      body = await parseBody(req);
    }
    const payload = { method, id, body };

    if (controller) return await controller(payload, res);
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'error', message: 'Not Found' }));
};
