const getEnv = (key: string, required = true) => {
  const env = process.env[key]
  if (!env && required) {
    throw new Error(`Environment variable ${key} was undefined!`)
  }
  return env
}

export const PUBSUB_EMULATOR_HOST = getEnv('PUBSUB_EMULATOR_HOST')
export const PUBSUB_SUBSCRIPTION_NAME = 'consumeUserData'
export const PUBSUB_TOPIC_NAME = 'PubSubExample'
export const PUBSUB_PROJECT_ID = getEnv('PUBSUB_PROJECT_ID')
export const NODE_ENV = getEnv('NODE_ENV', false) || 'production'
