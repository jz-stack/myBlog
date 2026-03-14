import express from 'express';
import { getStats, getIPstats } from '../controllers/statsController.js';

const router = express.Router();

router.get('/', getStats);
router.get('/:ip', getIPstats)

export default router;
