import { IUser } from './user'

// POST /login
export interface ILoginParams {
  email: string
  password: string
}
export interface ILoginResponse {
  user: IUser
  jwt: IJwt
}
export type IJwt = {
  expires: number
  token: string
}
