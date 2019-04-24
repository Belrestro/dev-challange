import {Router} from 'express';
import * as starshipService from '../services/starship.service';
import * as commandCenterService from '../services/commandCenter.service';
import * as coordinatorService from '../services/fleetCoordinator.service'

const router = Router();

router.get('/starships', async (req, res, next) => {
    try {
        const starships = await starshipService.getAllStarships();
        res.json(starships);
    } catch (e) {
        res.sendStatus(500);
    }
    next();
});

router.get('/starships/:starshipId', async (req, res, next) => {
    const {starshipId} = req.params;
    try {
        res.json(await starshipService.getStarship(starshipId));
    } catch (e) {
        res.sendStatus(500);
    }
    next();
});

router.get('/coordinators', async (req, res, next) => {
    try {
        const coordinators = await coordinatorService.getAllCoordinators();
        res.json(coordinators);
    } catch (e) {
        res.sendStatus(500);
    }
    next();
});

router.post('/coordinators/:coordinationCenter/to-sector/:sector', async (req, res, next) => {
    const {coordinationCenter, sector} = req.params;
    try {
        const {id: coordinationCenter, range: [sector]} = body;
        await coordinatorService.createCoordinator(id, range);
        res.json({created: true});
    } catch (e) {
        res.sendStatus(500).write(e);
    }
    next();
});

router.delete('/coordinators/:coordinationCenter', async (req, res, next) => {
    try {
        const {coordinationCenter} = req.params;
        await coordinatorService.deleteCoordinator(Number(coordinationCenter));
        res.json({closed: true});
    } catch (e) {
        res.json({closed: false});
    }
    next();
});

router.get('/logs', async (req, res, next) => {
    try {
        const csvData = await commandCenterService.getClogsInCSV();
        res.setHeader('Content-Disposition', 'attachment;filename=logs.csv'); 
        res.setHeader('Content-Type', 'text/csv');
        res.writeHead(200);
        res.write(csvData);
        res.end();
    } catch (e) {
        res.sendStatus(500);
    }
});

router.use(async (req, res, next) => {
    const {path} = req;
    try {
        commandCenterService.saveLog(path);
    } catch (e) {
        next(e);
    }
    next();
});

export default router;