import { IUser } from 'api/user/types';
import { v4 as uuidv4 } from 'uuid';

export default class InMemoryDb {
  private static instance: InMemoryDb;
  private users: IUser[] = [];

  private constructor() {}

  static getInstance(): InMemoryDb {
    if (!InMemoryDb.instance) {
      InMemoryDb.instance = new InMemoryDb();
    }
    return InMemoryDb.instance;
  }

  getAll(): IUser[] {
    return this.users;
  }

  getById(id: string): IUser | undefined {
    return this.users.find((user) => user.id === id);
  }

  create(user: IUser): IUser {
    const newUser = { ...user, id: uuidv4() };
    this.users.push(newUser);
    return newUser;
  }

  update(id: string, updatedUser: Partial<IUser>): IUser | undefined {
    const user = this.getById(id);
    if (user) {
      Object.assign(user, updatedUser);
      return user;
    }
    return undefined;
  }

  delete(id: string): boolean {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}
