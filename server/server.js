import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleWare/errorHandler.js';
import { visitorHandler } from './middleWare/visitorHandler.js';
import { query } from './utils/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);
// CORS 配置（允许跨域请求）
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // 生产环境建议指定具体域名
  credentials: true
}));

// 解析 JSON 请求体
app.use(express.json());
// 解析提交的表单数据到 req.body 中
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 访问统计中间件
app.use(visitorHandler)

// API 路由
app.use('/api', routes);

// 检查接口是否正常
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 404 处理
app.use(notFound);

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

const BING_API = "https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=10&nc=1612409408851&pid=hp&FORM=BEHPTB&uhd=1&uhdwidth=3840&uhdheight=2160";
const BING_URL = "https://cn.bing.com";
/**
 * 检查数据库并更新壁纸（启动时执行）
 */
async function updateBingWallpaper() {
  try {
    // 1. 查询数据库是否有符合条件的数据
    const result = await query("SELECT * FROM home_wallpaper WHERE date < CURDATE()");

    // 2. 有数据才执行更新逻辑
    if (result.length > 0) {
      // 3. 请求 Bing 壁纸接口
      const response = await fetch(BING_API);
      if (!response.ok) {
        throw new Error(`Bing API 请求失败：${response.status}`);
      }
      const data = await response.json();
      
      // 4. 校验返回数据
      if (!data.images || data.images.length === 0) {
        throw new Error("Bing API 返回无壁纸数据");
      }
      const { url, copyright, title } = data.images[0];

      await query(
        `UPDATE home_wallpaper 
         SET url = ?, copyright = ?, title = ?, date = CURDATE()
         WHERE date < CURDATE()`, // 仅更新过期数据
        [BING_URL + url, copyright, title]
      );
    }
  } catch (error) {
    console.error('更新壁纸失败：', error.message);
  }
}

updateBingWallpaper();
// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在${PORT}端口`);
});