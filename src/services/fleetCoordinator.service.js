import _ from 'lodash';
import * as mongoService from './mongo.service';
import * as workerService from './worker.service';
import * as gatesService from './gates.service';
import config from '../config';

const {FLEET_COORDINATORS} = config;

const getCoordinatorForSector = async (sector = 0) => {
    return mongoService.findOne(FLEET_COORDINATORS, {
        sectors: {
            $elemMatch: {
                lowerBound: {$lte: sector},
                upperBound: {$gt : sector}
            }
        }
    });
}

const getNextCoordinator = async id => {
    const coordinators = await mongoService.find(FLEET_COORDINATORS, {id: {$gt: id}});

    return _.get(_.sortBy(coordinators, 'id'), '0');
}

const getFirstCoordinator = async (id) => {
    const coordinators = await mongoService.find(FLEET_COORDINATORS, {id: {$lt: id}});

    return _.get(_.sortBy(coordinators, 'id'), '0');
}

export const initCoordinators = async () => {
    let coordinators = await mongoService.getAll(FLEET_COORDINATORS);
    const maxSector = await gatesService.getMaxSector();
    const ratio = 100;
    if ((!coordinators || coordinators.length === 0) && maxSector != 0) {
        const coordinatorsNumber = Math.ceil(maxSector / ratio);
        coordinators = []
        for (let id = 0; id < coordinatorsNumber; id += 1) {
            const lowerBound = id * ratio;
            const upperBound = lowerBound + ratio;
            coordinators.push({id, sectors: [{lowerBound, upperBound}]});
        }
        await mongoService.saveAll(FLEET_COORDINATORS, coordinators);
    }
    _.forEach(coordinators, coordinator => {
        workerService.ensureWorkerRegistered(coordinator);
    });
}

export const getCoordinator = (id) => {
    return mongoService.findOne(FLEET_COORDINATORS, {id});
}

export const getAllCoordinators = async () => {
    const coordinators = await mongoService.getAll(FLEET_COORDINATORS);
    return _.reduce(coordinators, (acc, coordinator) => {
        const {id, sectors} = coordinator;
        acc[id] = _.map(sectors, range => {
            const {lowerBound, upperBound} = range;
            return [lowerBound, upperBound];
        });
        return acc;
    }, {});
}

export const createCoordinator = async (id, range) => {
    const coordinator = await getCoordinator(id);
    if (coordinator) {
        throw new Error(`Coordinator with id ${id} already exists`);
    }
    const [lowerBound, upperBound] = range;
    const sectors = [{lowerBound, upperBound}];
    
    const nextCoordinator = await getCoordinatorForSector(upperBound - 1);
    if (nextCoordinator) {
        const newSectors = _.reduce(nextCoordinator.sectors, (acc, sector) => {
            if (sector.lowerBound < upperBound) {
                // coordinator has intersection
                if (sector.upperBound > upperBound) {
                    acc.push({lowerBound: upperBound, upperBound: sector.upperBound});
                }
                if (sector.lowerBound < lowerBound) {
                    acc.push({lowerBound: sector.lowerBound, upperBound: lowerBound});
                }
            } else if (sector.lowerBound >= upperBound || sector.upperBound < upperBound) {
                // no intersection whatsoever
                acc.push(sector);
            }
            
            return acc;
        }, []);

        await updateCoordinator(nextCoordinator.id, newSectors);
    }
    const previousCoordinator = await getCoordinatorForSector(lowerBound);
    if (previousCoordinator) {
        const newSectors = _.reduce(previousCoordinator.sectors, (acc, sector) => {
            if (sector.lowerBound < lowerBound && sector.upperBound > lowerBound) {
                // coordinator has intersection
                acc.push({lowerBound: sector.lowerBound, upperBound: lowerBound});
            } else if (sector.lowerBound < lowerBound && sector.upperBound < lowerBound) {
                // no intersection whatsoever
                acc.push(sector);
            }
            
            return acc;
        }, []);

        await updateCoordinator(previousCoordinator.id, newSectors);
    }

    await mongoService.save(FLEET_COORDINATORS, {id, sectors});
    workerService.ensureWorkerRegistered({id});
}

export const updateCoordinator = (id, sectors) => {
    return mongoService.update(FLEET_COORDINATORS, {id}, {id, sectors});
}

export const deleteCoordinator = async (id) => {
    const coordinator = await getCoordinator(id);
    const {sectors} = coordinator;
    let coordinatorInheritor = await getNextCoordinator(id);
    if (!coordinatorInheritor) {
        coordinatorInheritor = await getFirstCoordinator(id);
    }
    if (coordinatorInheritor) {
        const newSectors = _.concat(coordinatorInheritor.sectors, sectors);
        await updateCoordinator(coordinatorInheritor.id, newSectors);
    }

    workerService.removeWorker(id);
    await mongoService.deleteOne(FLEET_COORDINATORS, {id});
}

export const findRoute = async (sector) => {
    const coordinator = await getCoordinatorForSector(sector);
    if (coordinator) {
        return await workerService.sendRequestToWorker(coordinator.id, {sector});
    }

    return {};
}