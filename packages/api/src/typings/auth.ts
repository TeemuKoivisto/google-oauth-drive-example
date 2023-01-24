import { IUser } from '@my-org/types'

export interface ILoginJwt {
  expires: number
  user: IUser
}
export interface IResetPasswordJwt {
  userId: string
}
