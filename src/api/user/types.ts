export interface IUser {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

export interface IPayload {
  method?: string;
  body: unknown | null;
  id?: string;
}
