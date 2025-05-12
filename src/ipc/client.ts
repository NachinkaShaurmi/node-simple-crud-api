import { IPCRequest, IPCResponse } from './shareDB';

let messageId = 0;
const pending = new Map<string, { resolve: Function; reject: Function }>();

process.on('message', (msg: IPCResponse) => {
  const { id, status, result } = msg;
  if (pending.has(id)) {
    const { resolve, reject } = pending.get(id)!;
    status === 'ok' ? resolve(result) : reject(new Error(result));
    pending.delete(id);
  }
});

export function sendToMaster<T>(type: IPCRequest['type'], data?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = (++messageId).toString();
    pending.set(id, { resolve, reject });
    const message: IPCRequest = { id, type, data };

    if (process.send) process.send(message);
    else reject(new Error('IPC not available'));
  });
}
