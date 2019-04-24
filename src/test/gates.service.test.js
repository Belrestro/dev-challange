import _ from 'lodash';
import fs from 'fs';
import config from '../config';
import * as mongoService from '../services/mongo.service';
import * as redisService from '../services/redis.service';
import * as gatesService from '../services/gates.service';

const {GATES_INDEX, FILE_FOLDER} = config;

const gatesExample = `1 7 13 17 22 34 56 78
2 5 9 12 13 15 16 25 33 47
1 7 16 19 21 34 56 78
2 3 7 11 16 17 20 25 33 47
5 9 17 19 20 25 33 47`;
const gatesExampleOutput = [
  {
    securityLevel: 1,
    gates: [ 22, 34 ]
  },
  {
    securityLevel: 2,
    gates: [ 2, 5, 9, 12, 13, 15 ]
  },
  {
    securityLevel: 3,
    gates: [ 16, 19, 21 ]
  },
  {
    securityLevel: 4,
    gates: [ 2, 3, 7, 11, 16, 17 ]
  },
  {
    securityLevel: 5,
    gates: [ 17, 19, 20 ]
  }
];

describe('gates.service', () => {
    const tmpFolder = `${FILE_FOLDER}`;
    const fullPath = `${tmpFolder}/gates.test.txt`;
    const mongoData = {
        [GATES_INDEX]: []
    };

    beforeAll(() => {
        if (!fs.existsSync(tmpFolder)) {
            fs.mkdirSync(tmpFolder);
        }
        fs.writeFileSync(fullPath, gatesExample);


        redisService.flush = jest.fn(() => Promise.resolve());
        redisService.get = jest.fn(() => Promise.resolve(null));
        redisService.save = jest.fn(() => Promise.resolve(null));
        mongoService.deleteOne = jest.fn(() => Promise.resolve());
        mongoService.save = jest.fn((index, data) => {
            mongoData[index].push(data);
            return Promise.resolve();
        });
        mongoService.findOne = jest.fn((index) => {
            return Promise.resolve(_.get(mongoData[index], 0));
        });
    });

    afterEach(() => {
        mongoService.deleteOne.mockClear();
        mongoService.save.mockClear();
        redisService.flush.mockClear();
        redisService.get.mockClear();
        redisService.save.mockClear();
    });

    afterAll(() => {
        fs.unlinkSync(fullPath);
        jest.unmock(mongoService.deleteOne);
        jest.unmock(mongoService.save);
        jest.unmock(redisService.flush);
        jest.unmock(redisService.get);
        jest.unmock(redisService.save);
    });


    test('should parse gates file', async () => {
        const routes = await gatesService.importGates(fullPath);
        expect(_.isArray(routes)).toBe(true);
        expect(routes).toHaveLength(5);
        expect(redisService.flush).toHaveBeenCalled();
    });

    test('should return gates file', async () => {
        const routes = await gatesService.getRoutes();
        expect(_.isArray(routes)).toBe(true);
        expect(routes).toHaveLength(5);
    });

    test('should find correct path', async () => {
        const routes = await gatesService.findSector(56);
        expect(_.isArray(routes)).toBe(true);
        expect(routes).toEqual(gatesExampleOutput);
        expect(redisService.get).toHaveBeenCalled();
        expect(redisService.save).toHaveBeenCalled();
    });
});