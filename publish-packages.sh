#! /bin/bash

# We want errors to kill the script
set -e

# Go to root of repository
cd "$(dirname "$0")"

# Run our Node app
cd scripts/publish-packages
npm install
node index.js $@
