#! /bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

PACKAGE_DIRS=$DIR meteor test-packages \
  "$(pwd)/babel-tests"