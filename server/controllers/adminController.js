import { query } from '../utils/db.js'
import crypto from 'crypto'

/**
 * 生成标准UUID v4
 * @returns {string} 36位的UUID字符串
 */
const generateUUID = () => {
  return crypto.randomUUID(); //生成标准UUID v4
};

export const getArticles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const keyword = req.query.keyword || ''
    const tag = req.query.tag || ''
    const offset = (page - 1) * pageSize
    
    let sql = `
      SELECT a.id, a.title, a.excerpt, a.publish_date, a.cover_url, a.created_at,
             GROUP_CONCAT(DISTINCT at.tag) as tags
      FROM articles a
      LEFT JOIN article_tags at ON a.id = at.article_id
      WHERE 1=1
    `
    const params = []
    
    if (keyword) {
      sql += ' AND (a.title LIKE ? OR a.excerpt LIKE ? OR a.content LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }
    
    if (tag) {
      sql += ' AND EXISTS (SELECT 1 FROM article_tags WHERE article_id = a.id AND tag = ?)'
      params.push(tag)
    }
    
    sql += ' GROUP BY a.id ORDER BY a.created_at DESC LIMIT ? OFFSET ?'
    params.push(pageSize, offset)
    
    const articles = await query(sql, params)
    
    articles.forEach(article => {
      article.tags = article.tags ? article.tags.split(',') : []
    })
    
    let countSql = 'SELECT COUNT(DISTINCT a.id) as total FROM articles a'
    const countParams = []
    
    if (keyword) {
      countSql += ' WHERE a.title LIKE ? OR a.excerpt LIKE ? OR a.content LIKE ?'
      countParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }
    
    if (tag) {
      countSql += ' WHERE EXISTS (SELECT 1 FROM article_tags WHERE article_id = a.id AND tag = ?)'
      countParams.push(tag)
    }
    
    const countResult = await query(countSql, countParams)
    const total = countResult[0].total
    
    res.json({
      success: true,
      data: {
        list: articles,
        total,
        page,
        pageSize
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getTags = async (req, res, next) => {
  try {
    const tags = await query(`
      SELECT DISTINCT tag FROM article_tags ORDER BY tag
    `)
    
    res.json({
      success: true,
      data: tags.map(t => t.tag)
    })
  } catch (error) {
    next(error)
  }
}

export const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params
    
    const articles = await query('SELECT * FROM articles WHERE id = ?', [id])
    
    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      })
    }
    
    const article = articles[0]
    
    const tagRows = await query('SELECT tag FROM article_tags WHERE article_id = ?', [id])
    article.tags = tagRows.map(t => t.tag)
    
    res.json({
      success: true,
      data: article
    })
  } catch (error) {
    next(error)
  }
}

export const createArticle = async (req, res, next) => {
  try {
    const { title, content, excerpt, cover_url, tags } = req.body

    const publish_date = new Date().toISOString().slice(0, 19).replace('T', ' ')

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      })
    }

    const id = generateUUID()
    
    await query(`
      INSERT INTO articles (id, title, content, excerpt, cover_url, publish_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, title, content, excerpt || '', cover_url || '', publish_date])
    
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await query('INSERT INTO article_tags (id, article_id, tag) VALUES (?, ?, ?)', [generateUUID(), id, tag])
      }
    }
    
    res.json({
      success: true,
      message: '文章创建成功',
      data: { id }
    })
  } catch (error) {
    next(error)
  }
}

export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, content, excerpt, cover_url, tags } = req.body
    const publish_date = new Date().toISOString().slice(0, 19).replace('T', ' ')
    
    await query(`
      UPDATE articles 
      SET title = ?, content = ?, excerpt = ?, cover_url = ?, publish_date = ?
      WHERE id = ?
    `, [title, content, excerpt, cover_url, publish_date, id])
    
    await query('DELETE FROM article_tags WHERE article_id = ?', [id])
    
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await query('INSERT INTO article_tags (id, article_id, tag) VALUES (?, ?, ?)', [generateUUID(), id, tag])
      }
    }
    
    res.json({
      success: true,
      message: '文章更新成功'
    })
  } catch (error) {
    next(error)
  }
}

export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM article_tags WHERE article_id = ?', [id])
    await query('DELETE FROM article_comments WHERE article_id = ?', [id])
    await query('DELETE FROM articles WHERE id = ?', [id])
    
    res.json({
      success: true,
      message: '文章删除成功'
    })
  } catch (error) {
    next(error)
  }
}

export const getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const articleId = req.query.articleId || ''
    const offset = (page - 1) * pageSize
    
    let sql = `
      SELECT c.*, a.title as article_title
      FROM article_comments c
      LEFT JOIN articles a ON c.article_id = a.id
      WHERE 1=1
    `
    const params = []
    
    if (articleId) {
      sql += ' AND c.article_id = ?'
      params.push(articleId)
    }
    
    sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?'
    params.push(pageSize, offset)
    
    const comments = await query(sql, params)
    
    let countSql = 'SELECT COUNT(*) as total FROM article_comments WHERE 1=1'
    const countParams = []
    
    if (articleId) {
      countSql += ' WHERE article_id = ?'
      countParams.push(articleId)
    }
    
    const countResult = await query(countSql, countParams)
    const total = countResult[0].total
    
    res.json({
      success: true,
      data: {
        list: comments,
        total,
        page,
        pageSize
      }
    })
  } catch (error) {
    next(error)
  }
}

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM article_comments WHERE id = ?', [id])
    
    res.json({
      success: true,
      message: '评论删除成功'
    })
  } catch (error) {
    next(error)
  }
}

export const batchDeleteComments = async (req, res, next) => {
  try {
    const { ids } = req.body
    
    if (!ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要删除的评论'
      })
    }
    
    const placeholders = ids.map(() => '?').join(',')
    await query(`DELETE FROM article_comments WHERE id IN (${placeholders})`, ids)
    
    res.json({
      success: true,
      message: '批量删除成功'
    })
  } catch (error) {
    next(error)
  }
}

export const getRecentComments = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5
    
    const comments = await query(`
      SELECT c.*, a.title as article_title
      FROM article_comments c
      LEFT JOIN articles a ON c.article_id = a.id
      ORDER BY c.created_at DESC
      LIMIT ?
    `, [limit])
    
    res.json({
      success: true,
      data: comments
    })
  } catch (error) {
    next(error)
  }
}

export const getGuestbook = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const status = req.query.status
    const offset = (page - 1) * pageSize
    
    let sql = 'SELECT * FROM guestbook_messages WHERE 1=1'
    const params = []
    
    if (status !== undefined && status !== '') {
      sql += ' AND status = ?'
      params.push(parseInt(status))
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(pageSize, offset)
    
    const messages = await query(sql, params)
    
    let countSql = 'SELECT COUNT(*) as total FROM guestbook_messages WHERE 1=1'
    const countParams = []
    
    if (status !== undefined && status !== '') {
      countSql += ' AND status = ?'
      countParams.push(parseInt(status))
    }
    
    const countResult = await query(countSql, countParams)
    const total = countResult[0].total
    
    res.json({
      success: true,
      data: {
        list: messages,
        total,
        page,
        pageSize
      }
    })
  } catch (error) {
    next(error)
  }
}

export const updateGuestbookStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    await query('UPDATE guestbook_messages SET status = ? WHERE id = ?', [parseInt(status), id])
    
    res.json({
      success: true,
      message: '状态更新成功'
    })
  } catch (error) {
    next(error)
  }
}

export const deleteGuestbook = async (req, res, next) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM guestbook_messages WHERE id = ?', [id])
    
    res.json({
      success: true,
      message: '留言删除成功'
    })
  } catch (error) {
    next(error)
  }
}

export const batchDeleteGuestbook = async (req, res, next) => {
  try {
    const { ids } = req.body
    
    if (!ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要删除的留言'
      })
    }
    
    const placeholders = ids.map(() => '?').join(',')
    await query(`DELETE FROM guestbook_messages WHERE id IN (${placeholders})`, ids)
    
    res.json({
      success: true,
      message: '批量删除成功'
    })
  } catch (error) {
    next(error)
  }
}

export const getStatsOverview = async (req, res, next) => {
  try {
    const articleCount = await query('SELECT COUNT(*) as count FROM articles')
    const commentCount = await query('SELECT COUNT(*) as count FROM article_comments')
    const guestbookCount = await query('SELECT COUNT(*) as count FROM guestbook_messages')
    
    const visitStats = await query('SELECT total FROM visit_stats WHERE id = 1')
    const totalVisits = visitStats.length > 0 ? visitStats[0].total : 0
    
    const uniqueVisitors = await query('SELECT COUNT(*) as count FROM ip_visit_count')
    
    const today = new Date().toISOString().split('T')[0]
    const todayVisitors = await query(`
      SELECT COUNT(*) as count FROM ip_visit_count 
      WHERE DATE(last_visit_time) = ?
    `, [today])
    
    res.json({
      success: true,
      data: {
        totalVisits,
        uniqueVisitors: uniqueVisitors[0].count,
        todayVisitors: todayVisitors[0].count,
        totalArticles: articleCount[0].count,
        totalComments: commentCount[0].count,
        totalGuestbook: guestbookCount[0].count
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getStatsTrend = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7
    const dates = []
    const visits = []
    const uniqueVisitors = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dates.push(dateStr)
      
      const dayVisitors = await query(`
        SELECT COUNT(*) as count FROM ip_visit_count 
        WHERE DATE(last_visit_time) = ?
      `, [dateStr])
      uniqueVisitors.push(dayVisitors[0].count)
      
      visits.push(dayVisitors[0].count)
    }
    
    res.json({
      success: true,
      data: {
        dates,
        visits,
        uniqueVisitors
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getIPList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const orderBy = req.query.orderBy || 'last_visit_time'
    const order = req.query.order || 'DESC'
    const offset = (page - 1) * pageSize
    
    const allowedOrderFields = ['ip', 'visit_count', 'first_visit_time', 'last_visit_time']
    const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : 'last_visit_time'
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    
    const ipList = await query(`
      SELECT * FROM ip_visit_count 
      ORDER BY ${safeOrderBy} ${safeOrder}
      LIMIT ? OFFSET ?
    `, [pageSize, offset])
    
    const countResult = await query('SELECT COUNT(*) as total FROM ip_visit_count')
    const total = countResult[0].total
    
    res.json({
      success: true,
      data: {
        list: ipList,
        total,
        page,
        pageSize
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getPopularArticles = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5
    
    const articles = await query(`
      SELECT a.id, a.title, a.publish_date as date, COUNT(c.id) as views
      FROM articles a
      LEFT JOIN article_comments c ON a.id = c.article_id
      GROUP BY a.id
      ORDER BY views DESC
      LIMIT ?
    `, [limit])
    
    res.json({
      success: true,
      data: articles
    })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req, res, next) => {
  try {
    const admins = await query('SELECT id, username, nickname, avatar, created_at FROM admins WHERE id = ?', [req.user.id])
    
    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }
    
    res.json({
      success: true,
      data: admins[0]
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { nickname, avatar } = req.body
    
    await query('UPDATE admins SET nickname = ?, avatar = ? WHERE id = ?', [nickname, avatar, req.user.id])
    
    res.json({
      success: true,
      message: '更新成功'
    })
  } catch (error) {
    next(error)
  }
}

export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body
    
    const admins = await query('SELECT password FROM admins WHERE id = ?', [req.user.id])
    
    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }
    
    const isMatch = await bcrypt.compare(oldPassword, admins[0].password)
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      })
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await query('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, req.user.id])
    
    res.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    next(error)
  }
}