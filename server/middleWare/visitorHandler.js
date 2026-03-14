import { transaction } from "../utils/db.js";

export const visitorHandler = async (req, res, next) => {
    try {
        //获取真实IP
        const ip = 
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            'unknown';
        const realIp = ip.replace('::ffff:', '')
        req.clientIp = realIp
        //事务内完成：总访问数+1 + IP访问数新增/更新
        await transaction(async (conn) => {
            //更新网站总访问次数
            await conn.execute(
                'UPDATE visit_stats SET total = total + 1 WHERE id = 1'
            );
            //更新ip访问次数表
            await conn.execute(
                `INSERT INTO ip_visit_count (ip) VALUES (?) 
                 ON DUPLICATE KEY UPDATE 
                   visit_count = visit_count + 1,
                   last_visit_time = CURRENT_TIMESTAMP`,
                [realIp] // 传入真实IP参数，防止SQL注入
            );
        });
    } catch (error) {
        console.error('访问计数失败', error);
    }
    next()
}