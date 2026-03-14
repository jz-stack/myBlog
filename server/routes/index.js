import express from 'express';
import articlesRouter from './articles.js';
import guestbookRouter from './guestbook.js';
import statsRouter from './stats.js';
import aiRouter from './ai.js';
import authRouter from './auth.js';
import adminRouter from './admin.js';
import homeWallpaperRouter from './homeWallpaper.js';

const router = express.Router();

router.use('/articles', articlesRouter);
router.use('/guestbook', guestbookRouter);
router.use('/stats', statsRouter);
router.use('/ai', aiRouter);
router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/homeWallpaper', homeWallpaperRouter);

export default router;