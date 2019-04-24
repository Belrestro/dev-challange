import express from 'express';
import bodyParser from 'body-parser';
import busboy from 'connect-busboy';
import starshipRouter from './routes/starship.router';
import commandCenterRouter from './routes/commandCenter.router';
import * as gateService from './services/gates.service';
import * as coordinatorService from './services/fleetCoordinator.service';
const app = express();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(busboy());

app.use('/command-center', commandCenterRouter);
app.use('/starship', starshipRouter);
gateService.importGates('./gates.txt')
    .then(() => {
        coordinatorService.initCoordinators();
    });

app.listen(3001, () => {
    console.info(`Command center registered on port: 3001`);
});