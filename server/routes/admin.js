import express from 'express'
import { authMiddleware } from '../middleWare/authMiddleware.js'
import {
  getArticles,
  getTags,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getComments,
  deleteComment,
  batchDeleteComments,
  getRecentComments,
  getGuestbook,
  updateGuestbookStatus,
  deleteGuestbook,
  batchDeleteGuestbook,
  getStatsOverview,
  getStatsTrend,
  getIPList,
  getPopularArticles,
  getProfile,
  updateProfile,
  updatePassword 
} from '../controllers/adminController.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/articles', getArticles)
router.get('/articles/tags', getTags)
router.get('/articles/:id', getArticleById)
router.post('/articles', createArticle)
router.put('/articles/:id', updateArticle)
router.delete('/articles/:id', deleteArticle)

router.get('/comments', getComments)
router.delete('/comments/:id', deleteComment)
router.post('/comments/batch-delete', batchDeleteComments)
router.get('/comments/recent', getRecentComments)

router.get('/guestbook', getGuestbook)
router.put('/guestbook/:id/status', updateGuestbookStatus)
router.delete('/guestbook/:id', deleteGuestbook)
router.post('/guestbook/batch-delete', batchDeleteGuestbook)

router.get('/stats/overview', getStatsOverview)
router.get('/stats/trend', getStatsTrend)
router.get('/stats/ip-list', getIPList)
router.get('/stats/popular-articles', getPopularArticles)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.put('/password', updatePassword)

export default router
