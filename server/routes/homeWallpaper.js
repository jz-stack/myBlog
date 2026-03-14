import express from 'express';
import { query } from '../utils/db.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await query("SELECT * FROM home_wallpaper")
        res.json({
            success: true,
            data: result[0]
        })
    } catch (error) {
        next(error)
    }
});

export default router
