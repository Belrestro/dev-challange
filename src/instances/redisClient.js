import redis from 'redis';
import config from '../config';

const {REDIS_HOST, REDIS_PORT} = config
const options = {
    port  : REDIS_PORT,
    host  : REDIS_HOST,
    prefix: 'command-center'
};

export const connect = () => {
    return redis.createClient(options);
}