import {Router} from 'express';
import * as starshipService from '../services/starship.service';
import * as coordinatorService from '../services/fleetCoordinator.service';

const router = Router();

router.get('/:starshipId/route/to/:sector', async (req, res, next) => {
    try {
        const {starshipId, sector} = req.params;
        const result = await coordinatorService.findRoute(Number(sector))
        res.json(result);
        await starshipService.saveStarship({id: starshipId, sector: Number(sector)});
        await starshipService.saveStarshipLog(result);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

export default router;