#!/usr/bin/env bash

curl localhost:7086 \
  -X POST \
  -H "Content-Type: application/json" \
  --data @import.json
