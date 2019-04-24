import _ from 'lodash';
import fs from 'fs';
import readline from 'readline';
import * as mongoService from './mongo.service';
import * as redisService from './redis.service';
import config from '../config';

const {GATES_INDEX, REDIS_SECTOR_PREFIX} = config;

const parseGatesFile = (filename) => {
    const routes = []
    return new Promise(response => {
        const lineReader = readline.createInterface({
            input: fs.createReadStream(filename)
        });
        
        lineReader.on('line', (line) => {
            if (!line || !line.trim()) {
                return;
            }
            const points = line.split(/\s+/);
        
            routes.push(_.map(points, Number));
        });
        
        lineReader.on('close', () => {
            response(routes);
        });
    });
}

const findSectorInRoutes = (routes, sector) => {
    const response = [];

    let securityLevel = 1;
    let points = routes[0];
    let gates = [];
    let iterator = 0;
    let gate = points[0];
    let currentSector = 0;


    while (gate) {
        // make corrections to current gates
        if (currentSector < sector) {
            currentSector += gate;
            gates.push(gate);
            iterator+= 1;
            gate = points ? points[iterator] : null;
        } else if (currentSector > sector) {
            currentSector -= gates.shift();
        }

        // add gates if corrections succeed
        if (currentSector === sector) {
            response.push({securityLevel, gates });
            gate = null;
        }

        // search new security lvl
        if (!gate && routes[securityLevel]) {
            currentSector = 0;
            iterator = 0;
            securityLevel += 1;
            gates = [];
            points = routes[securityLevel - 1];
            gate = points ? points[iterator] : null;
        }
    }

    return response;
}

const getTargetSectorRouteFromCache = async (sector) => {
    const key = `${REDIS_SECTOR_PREFIX}-${sector}`;
    return redisService.get(key);
}

const saveTargetSectorRouteToCache = async (sector, routes) => {
    const key = `${REDIS_SECTOR_PREFIX}-${sector}`;
    return redisService.save(key, routes);
}

export const importGates = async (filename) => {
    const routes = await parseGatesFile(filename);
    await mongoService.deleteOne(GATES_INDEX);
    await mongoService.save(GATES_INDEX, {routes});
    await redisService.flush();
    return routes;
}

export const getRoutes = async () => {
    const response = await mongoService.findOne(GATES_INDEX);
    return _.get(response, 'routes', []);
}

export const findSector = async (sector) => {
    const cache = await getTargetSectorRouteFromCache(sector);
    if (cache) {
        return cache;
    }

    const allRoutes = await getRoutes();
    const routesToSector = findSectorInRoutes(allRoutes, sector);
    await saveTargetSectorRouteToCache(sector, routesToSector);

    return routesToSector;
}

export const getMaxSector = async () => {
    const routes = await getRoutes();
    let sector = 0;

    while (routes.length > 0) {
        const route = routes.pop();

        const sum = _.reduce(route, (a,b) => a + b, 0);
        if (sector < sum) {
            sector = sum;
        }
    }

    return sector;
}