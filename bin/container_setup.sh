#!/bin/bash

set -exuo pipefail
IFS=$'\n\t'

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "$DIR/.." || exit 1

# Compile code
npm install --production
