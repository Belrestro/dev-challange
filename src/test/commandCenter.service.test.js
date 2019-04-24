import _ from 'lodash';
import config from '../config';
import * as mongoService from '../services/mongo.service';
import * as commandCenterService from '../services/commandCenter.service';

const {CC_LOG_INDEX} = config;

describe('starship.service', () => {
    const mongoData = {
        [CC_LOG_INDEX]    : []
    };

    const logs = [
        `/command-center/starships/1`,
        `/command-center/starships`
    ]

    beforeAll(() => {
        mongoService.save = jest.fn((index, data) => {
            mongoData[index].push(data);
            return Promise.resolve();
        });
        mongoService.getAll = jest.fn((index) => {
            return Promise.resolve(mongoData[index]);
        });
    });

    afterEach(() => {
        mongoService.save.mockClear();
        mongoService.getAll.mockClear();
    });

    afterAll(() => {
        jest.unmock(mongoService.save);
        jest.unmock(mongoService.getAll);
    });

    test('should save log', async () => {
        await commandCenterService.saveLog(logs[0]);
        await commandCenterService.saveLog(logs[1]);
        expect(mongoData[CC_LOG_INDEX]).toHaveLength(2);
    });

    test('should return all logs', async () => {
        const result = await commandCenterService.getLogs();
        const requests = _.map(result, 'request');
        expect(result).toHaveLength(2);
        expect(requests).toContainEqual(logs[0]);
        expect(requests).toContainEqual(logs[1]);
    });
});