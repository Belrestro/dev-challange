import {connect} from '../instances/redisClient';

const options = {
    expiry: 60 * 5 // 5 min
};

export const save = async (key, value) => {
    const client = await connect();
    return new Promise((res, rej) => {
        return  client.set(key, JSON.stringify(value), 'EX', options.expiry, (err, result) => {
            return err ? rej(err) : res(result);
        });
    });
};

export const get = async (key) => {
    const client = await connect();
    return new Promise((res, rej) => {
        return  client.get(key, (err, result) => {
            return err ? rej(err) : res(JSON.parse(result));
        });
    });
};

export const flush = async () => {
    const client = await connect();
    return new Promise((res, rej) => {
        return  client.flushall((err, result) => {
            return err ? rej(err) : res(result);
        });
    });
}