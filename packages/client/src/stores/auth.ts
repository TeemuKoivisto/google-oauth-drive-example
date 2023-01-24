import { derived, get, writable } from 'svelte/store'
import type { IJwt, User, ILoginParams } from '@my-org/types'

import { persistedWritable } from './persist'

export const user = persistedWritable<User | null>(null, {
  key: 'user',
  storage: 'session'
})
export const jwt = persistedWritable<IJwt | null>(null, {
  key: 'jwt',
  storage: 'session'
})
export const jwtToken = derived(jwt, v => v?.token || '')
export const isLoggedIn = derived(jwt, v => v !== null) // TODO check for expiration
