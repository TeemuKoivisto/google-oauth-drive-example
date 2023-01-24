import { User } from '@my-org/types'

export interface ILoginJwt {
  expires: number
  user: User
}
