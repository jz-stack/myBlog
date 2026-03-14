import express from 'express';
import {
  getAllTags,
  getArticles,
  getFeaturedArticles,
  getArticleDetail,
  getArticleComments,
  addArticleComment
} from '../controllers/articleController.js';

const router = express.Router();

// 获取所有标签
router.get('/tags', getAllTags);
// 获取精选文章（最新6篇）
router.get('/featured', getFeaturedArticles);
// 获取文章列表（支持标签筛选）
router.get('/', getArticles);
// 获取文章详情
router.get('/:id', getArticleDetail);
// 获取文章评论列表
router.get('/:id/comments', getArticleComments);
// 添加文章评论
router.post('/:id/comments', addArticleComment);

export default router;