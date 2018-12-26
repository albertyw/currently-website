#!/bin/bash
# This script will build and deploy a new docker image

set -ex

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "$DIR"/..

# Update repository
git checkout master
git fetch -tp
git pull

# Build and start container
docker build -t codemancer:production .
docker stop codemancer || echo
docker container prune --force --filter "until=336h"
docker run \
    --detach \
    --restart always \
    --publish 127.0.0.1:5002:5002 \
    --name codemancer codemancer:production

# Cleanup docker
docker image prune --force --filter "until=336h"

# Update nginx
sudo service nginx reload
