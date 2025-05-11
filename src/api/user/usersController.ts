import { ServerResponse } from 'http';
import { IPayload, IUser } from './types';
import InMemoryDb from '../../db/inMemoryDB';
import { isValidUuid, isValidUser } from '../../utils/validators';

const db = InMemoryDb.getInstance();

export default async (payload: IPayload, res: ServerResponse) => {
  console.log('Controller called with payload:', payload);

  res.setHeader('Content-Type', 'application/json');
  const { method, id, body } = payload;

  if (method === 'GET' && !id) {
    const users = db.getAll();

    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'success', data: users }));
    return;
  }

  if (method === 'GET' && id) {
    if (!isValidUuid(id)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ status: 'error', message: 'Invalid ID format' }));
      return;
    }

    const user = db.getById(id);

    if (user) {
      res.statusCode = 200;
      res.end(JSON.stringify({ status: 'success', data: user }));
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

    const newUser = db.create(body as IUser);
    res.statusCode = 201;
    res.end(JSON.stringify({ status: 'success', data: newUser }));
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

    const updatedUser = db.update(id, body as Partial<IUser>);

    if (updatedUser) {
      res.statusCode = 200;
      res.end(JSON.stringify({ status: 'success', data: updatedUser }));
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

    const deleted = db.delete(id);

    if (deleted) {
      res.statusCode = 200;
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
