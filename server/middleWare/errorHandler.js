/**
 * 错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);

  // 数据库错误
  if (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_FIELD_ERROR') {
    return res.status(500).json({
      success: false,
      message: '数据库错误，请检查表结构'
    });
  }

  // 默认错误
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
};

/**
 * 404 处理
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
};