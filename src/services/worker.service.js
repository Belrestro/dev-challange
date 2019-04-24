import _ from 'lodash';
import path from 'path';
import { Worker } from 'worker_threads';

if (!global.WORKERS) {
    global.WORKERS = {};
}
export const getWorker = (id) => {
    return global.WORKERS[id];
}

export const registerWorker = (id) => {
    if (global.WORKERS[id]) {
        return;
    }
    const worker = new Worker(path.join(__dirname, '../instances/worker.js'), {
        workerData: {id}
    });

    global.WORKERS[id] = {id, worker};

    return worker;
}

export const removeWorker = (id) => {
    const workerData = getWorker(id);
    const {worker} = workerData;
    if (worker) {
        worker.removeAllListeners();
        worker.terminate();
        worker.unref();
        global.WORKERS = _.omit(global.WORKERS, [id]);
    }
}

export const ensureWorkerRegistered = async (center) => {
    const worker = getWorker(center.id);
    if (!worker) {
        await registerWorker(center.id);
    }
    return worker;
}

export const sendRequestToWorker = (id, payload) => {
    return new Promise(res => {
        const workerData = getWorker(id);
        const {worker} = workerData;

        worker.on('message', data => {
            res(data);
        });
        worker.postMessage(payload);
    });
}
