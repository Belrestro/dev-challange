import _ from 'lodash';
import * as mongoService from './mongo.service';
import config from '../config';

const {STARSHIP_INDEX, STARSHIP_LOG_INDEX} = config;

const ensureStarshipRegistered = async (id, sector) => {
    const starship = await getStarship(id);
    if (!starship) {
        await mongoService.save(STARSHIP_INDEX, {id, sector});
    }
};

export const getStarship = async (id) => {
    const starship = await mongoService.findOne(STARSHIP_INDEX, {id});
    if (starship) {
        const {sector} = starship;
        const routes = await getStarshipLogs(id);
        
        return _.assign({id, sector, routes});
    }
    return null;
}

export const getAllStarships = async () => {
    const starships = await mongoService.getAll(STARSHIP_INDEX);
    return _.map(starships, ship => {
        const {id, sector} = ship;
        return {id, sector};
    });
}

export const saveStarship = async (data) => {
    const {id, sector} = data;
    await ensureStarshipRegistered(id);
    return mongoService.update(STARSHIP_INDEX, {id}, {id, sector});
}

export const saveStarshipLog = (data) => {
    const log = _.cloneDeep(data);
    const timestamp = Date.now();
    return mongoService.save(STARSHIP_LOG_INDEX, _.assign(log, timestamp));
}

export const getStarshipLogs = async (starshipId) => {
    const logs = await mongoService.find(STARSHIP_LOG_INDEX, {starshipId});

    return _.chain(logs)
        .sortBy('timestamp')
        .reduce((acc, log) => {
            const {timestamp, routes} = log;
            if (!acc[timestamp]) {
                acc[timestamp] = routes;
            } else {
                acc[timestamp] = _.chain(acc[timestamp])
                    .concat(routes)
                    .sortBy('securityLevel')
                    .value();
            }
            return acc;
        }, {})
        .value();
}