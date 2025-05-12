import { ServerResponse } from 'http';
import { IPayload, IUser } from './types';
import InMemoryDb from '../../db/inMemoryDB';
import { isValidUuid, isValidUser } from '../../utils/validators';
import { sendToMaster } from '../../ipc/client';
import cluster from 'cluster';

const isClustered = cluster.isWorker;

export default async (payload: IPayload, res: ServerResponse) => {
  const db = InMemoryDb.getInstance();

  console.log('Controller called with payload:', payload, 'isClustered:', isClustered);

  res.setHeader('Content-Type', 'application/json');
  const { method, id, body } = payload;

  if (method === 'GET' && !id) {
    const users = isClustered ? await sendToMaster('getAll') : db.getAll();

    res.statusCode = 200;
    res.end(JSON.stringify(users));
    return;
  }

  if (method === 'GET' && id) {
    if (!isValidUuid(id)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ status: 'error', message: 'Invalid ID format' }));
      return;
    }

    const user = isClustered ? await sendToMaster('getById', { id }) : db.getById(id);

    if (user) {
      res.statusCode = 200;
      res.end(JSON.stringify(user));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ status: 'error', message: 'User not found' }));
    }
    return;
  }

  if (method === 'POST') {
    if (!body || !isValidUser(body) || id) {
      res.statusCode = 400;
      res.end(JSON.stringify({ status: 'error', message: 'Invalid user data' }));
      return;
    }

    const newUser = isClustered
      ? await sendToMaster('create', { user: body })
      : db.create(body as IUser);

    res.statusCode = 201;
    res.end(JSON.stringify(newUser));
    return;
  }

  if (method === 'PUT') {
    if (!body || !isValidUser(body) || !id) {
      res.statusCode = 400;
      res.end(JSON.stringify({ status: 'error', message: 'Invalid user data or ID' }));
      return;
    }

    if (!isValidUuid(id)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ status: 'error', message: 'Invalid ID format' }));
      return;
    }

    const updatedUser = isClustered
      ? await sendToMaster('update', { id, user: body })
      : db.update(id, body);

    if (updatedUser) {
      res.statusCode = 200;
      res.end(JSON.stringify(updatedUser));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ status: 'error', message: 'User not found' }));
    }
    return;
  }

  if (method === 'DELETE') {
    if (!id) {
      res.statusCode = 400;
      res.end(JSON.stringify({ status: 'error', message: 'ID is required' }));
      return;
    }

    if (!isValidUuid(id)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ status: 'error', message: 'Invalid ID format' }));
      return;
    }

    const deleted = isClustered ? await sendToMaster('delete', { id }) : db.delete(id);

    if (deleted) {
      res.statusCode = 204;
      res.end(JSON.stringify({ status: 'success', message: 'User deleted successfully' }));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ status: 'error', message: 'User not found' }));
    }
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ status: 'error', message: 'Not Found' }));
};
