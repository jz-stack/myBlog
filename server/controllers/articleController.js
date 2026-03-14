import { query } from '../utils/db.js';
import crypto from 'crypto'

/**
 * 生成标准UUID v4
 * @returns {string} 36位的UUID字符串
 */
const generateUUID = () => {
  return crypto.randomUUID(); //生成标准UUID v4
};

/**
 * 获取所有标签列表
 */
export const getAllTags = async (req, res, next) => {
  try {
    const tags = await query('SELECT DISTINCT tag FROM article_tags ORDER BY tag');
    res.json({
      success: true,
      data: tags.map(row => row.tag)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取文章列表
 * 支持按标签筛选、关键词搜索和分页
 */
export const getArticles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 9;
    const offset = (page - 1) * pageSize;
    const tag = req.query.tag || '';
    const keyword = req.query.keyword || '';

    let whereConditions = [];
    let params = [];

    if (tag && tag !== '') {
      whereConditions.push(`EXISTS (
        SELECT 1 
        FROM article_tags at 
        WHERE at.article_id = v.id 
        AND at.tag = ?
      )`);
      params.push(tag);
    }

    if (keyword && keyword !== '') {
      whereConditions.push(`(v.title LIKE ? OR v.excerpt LIKE ?)`);
      const searchPattern = `%${keyword}%`;
      params.push(searchPattern, searchPattern);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const countSql = `
      SELECT COUNT(DISTINCT v.id) as total
      FROM vw_articles_with_tags v
      ${whereClause}
    `;

    const dataSql = `
      SELECT 
        v.id,
        v.title,
        v.excerpt,
        v.date,
        v.cover,
        v.tags_array AS tags
      FROM vw_articles_with_tags v
      ${whereClause}
      ORDER BY v.date DESC, v.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const [countResult] = await query(countSql, params);
    const total = countResult.total;

    const articles = await query(dataSql, params);

    const processedArticles = articles.map(article => ({
      ...article,
      tags: typeof article.tags === 'string' 
        ? JSON.parse(article.tags) 
        : article.tags || []
    }));

    res.json({
      success: true,
      data: {
        list: processedArticles,
        total: total
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取精选文章（最新6篇）
 */
export const getFeaturedArticles = async (req, res, next) => {
  try {
    const articles = await query(`
      SELECT 
        id,
        title,
        excerpt,
        date,
        cover,
        tags_array AS tags
      FROM vw_articles_with_tags
      ORDER BY date DESC, created_at DESC
      LIMIT 6
    `);

    const processedArticles = articles.map(article => ({
      ...article,
      tags: typeof article.tags === 'string' 
        ? JSON.parse(article.tags) 
        : article.tags || []
    }));

    res.json({
      success: true,
      data: processedArticles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取文章详情
 */
export const getArticleDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [article] = await query(
      `SELECT 
        id,
        title,
        excerpt,
        content,
        date,
        cover,
        tags,
        comment_count,
        last_comment_time
      FROM vw_article_detail
      WHERE id = ?`,
      [id]
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    article.tags = typeof article.tags === 'string' && article.tags.trim() 
      ? article.tags.split(',').map(tag => tag.trim())  // 按逗号分割并去空格
      : [];

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取文章评论列表
 */
export const getArticleComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    const comments = await query(
      `SELECT 
        id,
        article_id,
        author_name,
        content,
        created_at
      FROM article_comments
      WHERE article_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [id, pageSize, offset]
    );

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 添加文章评论
 */
export const addArticleComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, content } = req.body;

    // 验证参数
    if (!name || !content) {
      return res.status(400).json({
        success: false,
        message: '姓名和内容不能为空'
      });
    }

    // 检查文章是否存在
    const [article] = await query('SELECT id FROM articles WHERE id = ?', [id]);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }
    
    const commentId = generateUUID();
    // 插入评论
    const result = await query(
      `INSERT INTO article_comments (id, article_id, author_name, content)
       VALUES (?, ?, ?, ?)`,
      [commentId, id, name, content]
    );

    res.json({
      success: true,
      message: '评论添加成功',
      data: {
        id: commentId
      }
    });
  } catch (error) {
    next(error);
  }
};