import {connect} from '../instances/mongoClient';
import config from '../config';

const DBRequest = (request) => {
    return async (...args) => {
        const client = await connect();
        const db = client.db(config.DB_NAME);
        const response = await request.call(this, db, ...args);
        await client.close();
        return response;
    }
}

export const getAll = DBRequest(async (db, collection) => {
    return await db
        .collection(collection)
        .find({})
        .toArray();
});

export const find = DBRequest(async (db, collection, query = {}) => {
    return await db
        .collection(collection)
        .find(query)
        .toArray();
});

export const findOne = DBRequest(async (db, collection, query = {}) => {
    return await db
        .collection(collection)
        .findOne(query);
});

export const save = DBRequest(async (db, collection, record) => {
    return await db
        .collection(collection)
        .insertOne(record)
        .then(result => result.ops);
});

export const saveAll = DBRequest(async (db, collection, records) => {
    return await db
        .collection(collection)
        .insertMany(records)
        .then(result => result.ops);
});

export const update = DBRequest(async (db, collection, query = {}, changes) => {
    return await db
        .collection(collection)
        .updateOne(query, {$set: changes});
});

export const updateAll = DBRequest(async (db, collection, query = {}, changes) => {
    return await db
        .collection(collection)
        .updateMany(query, {$set: changes});
});

export const deleteOne = DBRequest(async (db, collection, query = {}) => {
    return await db
        .collection(collection)
        .deleteOne(query);
});

export const dropCollection = DBRequest(async (db, collection) => {
    return await db
        .collection(collection)
        .dropCollection();
});
