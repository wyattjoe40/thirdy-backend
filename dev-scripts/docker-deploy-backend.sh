#!/bin/bash

# docker run -d -p 27017:27017 --network thirdy-network --name thirdy-db mongo
# docker run -d thirdy-db

docker build --tag thirdy-backend .
docker run --interactive --tty --rm -p 3001:3001 --network thirdy-network --name thirdy-backend thirdy-backend