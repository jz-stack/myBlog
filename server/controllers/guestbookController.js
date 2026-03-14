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
 * 获取留言列表
 */
export const getGuestbookMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const messages = await query(
      `SELECT 
        id,
        author_name,
        content,
        created_at,
        mail
      FROM guestbook_messages
      ORDER BY created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}`
    );

    const [countResult] = await query('SELECT COUNT(*) as total FROM guestbook_messages WHERE status = 1');
    const total = countResult.total;

    res.json({
      success: true,
      data: {
        list: messages,
        total: total
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 添加留言
 */
export const addGuestbookMessage = async (req, res, next) => {
  try {
    const { author_name, content, mail } = req.body;

    // 验证参数
    if (!author_name || !content) {
      return res.status(400).json({
        success: false,
        message: '姓名和内容不能为空'
      });
    }

    //生成唯一ID
    const messageId = generateUUID();

    // 插入留言
    await query(
      `INSERT INTO guestbook_messages (id, author_name, content, mail, status)
       VALUES (?, ?, ?, ?, 0)`,
      [messageId, author_name, content, mail || null]
    );

    res.json({
      success: true,
      message: '留言添加成功',
      data: {
        id: messageId,
        author_name,
        mail: mail || null,
        content
      }
    });
  } catch (error) {
    next(error);
  }
};