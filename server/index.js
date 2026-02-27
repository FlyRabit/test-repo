require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  const configured = !!(process.env.XHS_APP_KEY && process.env.XHS_APP_SECRET);
  res.json({
    status: 'ok',
    configured,
    message: configured
      ? '小红书 API 已配置'
      : '请在 .env 文件中配置 XHS_APP_KEY 和 XHS_APP_SECRET',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.use((err, req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`\n  小红书运营系统 API 服务器`);
  console.log(`  ➜  运行于: http://localhost:${PORT}`);
  console.log(`  ➜  健康检查: http://localhost:${PORT}/api/health`);
  if (!process.env.XHS_APP_KEY || !process.env.XHS_APP_SECRET) {
    console.log(`\n  ⚠️  未检测到小红书 API 凭证，请在 .env 中配置:`);
    console.log(`     XHS_APP_KEY=你的AppKey`);
    console.log(`     XHS_APP_SECRET=你的AppSecret\n`);
  }
});
