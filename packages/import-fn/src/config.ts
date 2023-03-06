const getEnv = (key: string, required = true) => {
  const env = process.env[key]
  if (!env && required) {
    throw new Error(`Environment variable ${key} was undefined!`)
  }
  return env
}

const parseInteger = (env?: string) => {
  try {
    return parseInt(env || '')
  } catch (err) {}
  return undefined
}

export const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID')
export const GOOGLE_CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET')
export const GOOGLE_OAUTH_CALLBACK_URL = getEnv('GOOGLE_OAUTH_CALLBACK_URL')
export const NODE_ENV = getEnv('NODE_ENV', false) || 'production'
