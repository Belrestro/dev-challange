import config from '../config';
import {MongoClient, Server} from 'mongodb';

const {MONGO_DB_HOST, MONGO_DB_PORT} = config;

const options = {
    native_parser: true
};

export const connect = async () => {
    const client = new MongoClient(new Server(MONGO_DB_HOST, MONGO_DB_PORT), options);

    return client.connect();
}
