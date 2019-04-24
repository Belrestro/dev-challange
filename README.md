
# Rebel command center

## installation

**docker-compose**
run `docker-compose up -d` this should be enough

**local server**
run `npm install && npm run server`

server uses `3001` port

## dependencies

- mongodb : `127.0.0.1:27017` as a default, you may specify `MONGO_DB_HOST` and `MONGO_DB_PORT`
- redis : `127.0.0.1:6379` as a default, you may specify `REDIS_HOST` and `REDIS_PORT`

## test

`npm run test`

## api

**GET**:  `/starship/:starshipId/route/to/:sector`  - *returns all possible routes to desired sector sorted by security level*

**GET**:  `/command-center/logs`  - *returns all requests from command center in CSV*

**GET**:  `/command-center/coordinators`  - *returns all coordinators*

**POST**:  `/coordinators/:coordinationCenter/to-sector/:sector`  - *returns all coordinators* expects {id: number, range: [number, number]}

**DELETE**:  `/command-center/coordinators/:coordinationCenter`  - *closes coordination center end reassigns sector between others*

**GET**:  `/command-center/starships`  - *returns all registered starships, starship id, and it's last requested sector*

**GET**:  `/command-center/starships/:starshipId`  - *returns starship with id `starshipId` and all routes in chronological order*

**GET**:  `/command-center/logs`  - *returns all requests from command center in CSV*


## next steps

Found task rather enjoyable and hard, that's cool.

Ugly as it is, I'm using global to store workers,
I'm sure there's a way to communicate via threadId, just didn't figured it out yet

This app definitely could use some integration test