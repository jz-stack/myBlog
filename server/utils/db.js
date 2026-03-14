import pool from '../config/database.js';

/**
 * 执行查询
 * @param {string} sql - SQL 语句
 * @param {Array} params - 参数数组
 * @returns {Promise} 查询结果
 */
export const query = async (sql, params = []) => {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
};

/**
 * 执行事务
 * @param {Function} callback - 事务回调函数
 * @returns {Promise} 事务结果
 */
export const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    //开始事务
    await connection.beginTransaction();
    //执行回调函数，传入连接对象
    const result = await callback(connection);
    //提交事务
    await connection.commit();
    //返回结果
    return result;
  } catch (error) {
    //发生错误时回滚事务
    await connection.rollback();
    throw error;
  } finally {
    //无论成功失败，都释放连接回连接池
    connection.release();
  }
};

export default pool;