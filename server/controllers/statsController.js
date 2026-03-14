import { query } from '../utils/db.js';

/**
 * 获取统计数据（文章数、留言数）
 */
export const getStats = async (req, res, next) => {
  try {
    const [articleCount] = await query('SELECT COUNT(*) as count FROM articles');
    const [guestbookCount] = await query('SELECT COUNT(*) as count FROM guestbook_messages');
    const [visitorTotal] = await query('SELECT total as count FROM visit_stats WHERE id = 1');
    res.json({
      success: true,
      data: {
        article_count: articleCount.count,
        guestbook_count: guestbookCount.count,
        // 访客数需要单独统计，这里返回0或从其他表获取
        visitor_count: visitorTotal.count || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getIPstats = async (req , res, next) => {
  try {
    const { ip } = req.params
    
    if(!ip) {
      return res.status(400).json({
        success: false,
        message: '参数错误：缺少IP地址'
      });
    }
    const formattedIp = ip.replace('::ffff:', '');
    const [result] = await query(
      'SELECT visit_count FROM ip_visit_count WHERE ip = ?',
      [formattedIp] // 传入格式化后的IP，保证查询精准
    );
    const visitCount = result?.visit_count || 0;

    res.json({
      success: true,
      data: {
        ip: formattedIp,
        visitCount
      }
    });
  } catch (error) {
    next(error);
  }
}