import * as consumer from './consumer'
import * as publisher from './publisher'

const arg = process.argv[2]

if (arg === 'pub') {
  publisher.run()
} else if (arg === 'sub') {
  consumer.run()
} else {
  throw Error(`Unknown command '${arg}', available commands: pub | sub`)
}
