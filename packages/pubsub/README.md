# PubSub example

Based on:

- https://betterjavacode.com/programming/how-to-use-pub-sub-with-nodejs

1. Run: `gcloud components install pubsub-emulator`
2. Run: `gcloud beta emulators pubsub start --project=pubsubdemo --host-port=localhost:8085`
3. Copy: `cp .env-example .env`
4. Run both: `pnpm sub` and `pnpm pub` in separate terminals
