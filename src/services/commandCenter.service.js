import _ from 'lodash';
import * as mongoService from './mongo.service';
import config from '../config';

const {CC_LOG_INDEX} = config;

export const saveLog = (request) => {
    const timestamp = Date.now();
    return mongoService.save(CC_LOG_INDEX, {request, timestamp});
}

export const getLogs = async () => {
    const logs = await mongoService.getAll(CC_LOG_INDEX);

    return _.chain(logs)
        .map((log) => {
            const {request, timestamp} = log;
            return {request, timestamp};
        })
        .sortBy(logs, 'timestamp')
        .value();
}

export const getClogsInCSV = async () => {
    const logs = await getLogs();
    const headers = _.keys(logs[0]).join(',');
    const data = _.reduce(logs, (acc, log) => {
        acc += _.values(log).join(',') + '\n';
        return acc;
    }, '');
    return `${headers}\n${data}`;
}