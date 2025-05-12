import { validate as isUuid } from 'uuid';
import { IUser } from 'api/user/types';

export const isValidUuid = (id: string): boolean => isUuid(id);

export const isValidUser = (body: Partial<IUser>): boolean => {
  return (
    typeof body?.username === 'string' &&
    typeof body?.age === 'number' &&
    Array.isArray(body?.hobbies)
  );
};
