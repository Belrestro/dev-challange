import _ from 'lodash';
import  { parentPort, workerData } from 'worker_threads';
import * as gatesService from '../services/gates.service';

const findRoutes = (sector) => {
    return gatesService.findSector(Number(sector));
}

parentPort.on('message', async (data) => {
    const {sector} = data;
    const routes = await findRoutes(sector); 
    parentPort.postMessage({coordinationCenter: workerData.id, routes});
});