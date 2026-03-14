import express from 'express';
import {
  getGuestbookMessages,
  addGuestbookMessage
} from '../controllers/guestbookController.js';

const router = express.Router();

// 获取留言列表
router.get('/', getGuestbookMessages);

// 添加留言
router.post('/', addGuestbookMessage);

export default router;