import { Maybe, ILoginParams, User } from '@my-org/types'

export const authService = {
  loginUser: async ({ email, password }: ILoginParams): Promise<Maybe<User>> => {
    if (email !== 'me@example.com' || password !== 'asdfasdf') {
      return { err: 'Invalid credentials', code: 401 }
    }
    return {
      data: {
        id: 1,
        email: 'me@example.com',
        firstname: 'Mario',
        lastname: 'Sanchez'
      }
    }
  }
}
