import express from 'express'
import { chat, getHistory } from '../controllers/aiController.js'

const router = express.Router()

router.post('/chat', chat)
router.get('/history', getHistory)

export default router
