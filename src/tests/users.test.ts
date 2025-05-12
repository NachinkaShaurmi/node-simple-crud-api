import request from 'supertest';
import server from '../server';
import { IUser } from '../api/user/types';

describe('Users API', () => {
  let userId: string;

  const validUser = {
    username: 'John Doe',
    age: 30,
    hobbies: ['reading', 'gaming'],
  };

  const createUser = async (user: Omit<IUser, 'id'>) => {
    const res = await request(server).post('/api/users').send(user);
    return res.body.id;
  };

  beforeEach(async () => {
    const res = await request(server).get('/api/users');
    const users = res.body;
    for (const user of users) {
      await request(server).delete(`/api/users/${user.id}`);
    }
  });

  afterAll(() => {
    server.close();
  });

  test('Scenario 1: Full CRUD cycle', async () => {
    let res = await request(server).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);

    res = await request(server).post('/api/users').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.username).toBe(validUser.username);
    expect(res.body.age).toBe(validUser.age);
    expect(res.body.hobbies).toEqual(validUser.hobbies);
    userId = res.body.id;

    res = await request(server).get(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ...validUser, id: userId });

    const updatedUser = { ...validUser, age: 31, hobbies: ['coding'] };
    res = await request(server).put(`/api/users/${userId}`).send(updatedUser);
    expect(res.status).toBe(200);
    expect(res.body.age).toBe(31);
    expect(res.body.hobbies).toEqual(['coding']);
    expect(res.body.id).toBe(userId);

    res = await request(server).delete(`/api/users/${userId}`);
    expect(res.status).toBe(204);

    res = await request(server).get(`/api/users/${userId}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: 'error', message: 'User not found' });
  });

  test('Scenario 2: POST with invalid user data', async () => {
    const invalidUser = { username: 'Jane' };
    let res = await request(server).post('/api/users').send(invalidUser);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 'error', message: 'Invalid user data' });

    const invalidTypes = {
      username: 123,
      age: '30',
      hobbies: 'reading',
    };
    res = await request(server).post('/api/users').send(invalidTypes);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 'error', message: 'Invalid user data' });
  });

  test('Scenario 3: Operations with invalid UUID', async () => {
    const invalidUuid = 'invalid-uuid';

    let res = await request(server).get(`/api/users/${invalidUuid}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 'error', message: 'Invalid ID format' });

    res = await request(server).put(`/api/users/${invalidUuid}`).send(validUser);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 'error', message: 'Invalid ID format' });

    res = await request(server).delete(`/api/users/${invalidUuid}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 'error', message: 'Invalid ID format' });
  });

  test('Scenario 4: Non-existing endpoint returns 404', async () => {
    const res = await request(server).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: 'error', message: 'Not Found' });
  });

  test('Scenario 5: Multiple users handling', async () => {
    const user1Id = await createUser({ ...validUser, username: 'User 1' });
    const user2Id = await createUser({ ...validUser, username: 'User 2' });

    const res = await request(server).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body).toContainEqual(expect.objectContaining({ id: user1Id, username: 'User 1' }));
    expect(res.body).toContainEqual(expect.objectContaining({ id: user2Id, username: 'User 2' }));
  });
});
