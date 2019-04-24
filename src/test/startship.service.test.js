import _ from 'lodash';
import config from '../config';
import * as mongoService from '../services/mongo.service';
import * as starshipService from '../services/starship.service';

const {STARSHIP_INDEX, STARSHIP_LOG_INDEX} = config;

describe('starship.service', () => {
    const mongoData = {
        [STARSHIP_INDEX]    : [],
        [STARSHIP_LOG_INDEX]: []
    };
    const starship1 = {
        id     : 'wonderer',
        sector : 56
    };
    const starship2 = {
        id     : 'rebelion',
        sector : 48
    };

    beforeAll(() => {
        mongoService.save = jest.fn((index, data) => {
            mongoData[index].push(data);
            return Promise.resolve();
        });
        mongoService.find = jest.fn((index, data) => {
            return Promise.resolve(_.filter(mongoData[index], data));
        });
        mongoService.findOne = jest.fn((index, data) => {
            return Promise.resolve(_.find(mongoData[index], data));
        });
        mongoService.getAll = jest.fn((index) => {
            return Promise.resolve(mongoData[index]);
        });
        mongoService.update = jest.fn((index, data, changes) => {
            const record = _.find(mongoData[index], data);
            _.assign(record, changes);
            return Promise.resolve(record);
        });
    });

    afterEach(() => {
        mongoService.save.mockClear();
        mongoService.find.mockClear();
        mongoService.findOne.mockClear();
        mongoService.update.mockClear();
        mongoService.getAll.mockClear();
    });

    afterAll(() => {
        jest.unmock(mongoService.save);
        jest.unmock(mongoService.find);
        jest.unmock(mongoService.findOne);
        jest.unmock(mongoService.update);
        jest.unmock(mongoService.getAll);
    });

    test('should save starship', async () => {
        const result = await starshipService.saveStarship(_.clone(starship1));
        expect(mongoService.save).toHaveBeenCalled();
        expect(mongoData[STARSHIP_INDEX]).toHaveLength(1);
        expect(_.get(mongoData[STARSHIP_INDEX], 0)).toEqual(starship1);
        expect(result).toEqual(starship1);
    });

    test('should return starship', async () => {
        await starshipService.saveStarship(_.clone(starship2));
        const result1 = await starshipService.getStarship(starship1.id);
        const result2 = await starshipService.getStarship(starship2.id);
        expect(mongoService.findOne).toHaveBeenCalled();
        const exampleData1 = _.assign(_.clone(starship1), {routes: {}});
        const exampleData2 = _.assign(_.clone(starship2), {routes: {}});
        expect(result1).toEqual(exampleData1);
        expect(result2).toEqual(exampleData2);
    });

    test('should return all starships', async () => {
        const result = await starshipService.getAllStarships();
        expect(_.isArray(result)).toBe(true);
        expect(result).toContainEqual(starship1);
        expect(result).toContainEqual(starship2);
    });

    test('should should update single starship', async () => {
        _.assign(starship1, {sector: 1212});
        await starshipService.saveStarship(starship1);
        const all = await starshipService.getAllStarships();
        const result = await starshipService.getStarship(starship1.id);
        expect(all).toContainEqual(starship1);
        expect(result).toEqual(_.assign(_.clone(starship1), {routes: {}}));
    });

    test('should save and get starship logs', async () => {
        const routes = [{gates: [1,2,3], securityLevel: 1}];
        await starshipService.saveStarshipLog(starship1.id, routes);
        const result = await starshipService.getStarship(starship1.id);
        const resultRoutes = _.get(result, 'routes', {});
        expect(_.values(resultRoutes)).toContainEqual(routes);
    });
});