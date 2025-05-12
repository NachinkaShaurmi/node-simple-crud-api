import InMemoryDb from '../db/inMemoryDB';
import { Worker } from 'cluster';

export interface IPCRequest {
  id: string;
  type: 'getAll' | 'getById' | 'create' | 'update' | 'delete';
  data?: any;
}

export interface IPCResponse {
  id: string;
  status: 'ok' | 'error';
  result: any;
}

const db = InMemoryDb.getInstance();

export const handleWorkerMessage = (msg: IPCRequest, worker: Worker) => {
  const { id, type, data } = msg;
  let result: any;
  let status: 'ok' | 'error' = 'ok';

  try {
    switch (type) {
      case 'getAll':
        result = db.getAll();
        break;
      case 'getById':
        result = db.getById(data.id);
        break;
      case 'create':
        result = db.create(data.user);
        break;
      case 'update':
        result = db.update(data.id, data.user);
        break;
      case 'delete':
        result = db.delete(data.id);
        break;
      default:
        throw new Error('Invalid operation');
    }
  } catch (e) {
    status = 'error';
    result = (e as Error).message;
  }

  const response: IPCResponse = { id, status, result };
  worker.send(response);
};
