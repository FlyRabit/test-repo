const { Router } = require('express');
const { XhsClient } = require('../lib/xhs-client');
const sessionStore = require('../lib/session-store');

const router = Router();

function getClient() {
  return new XhsClient(process.env.XHS_APP_KEY, process.env.XHS_APP_SECRET);
}

function requireAuth(req, res, next) {
  const sessionId = req.headers['x-session-id'] || req.cookies?.xhs_session;
  if (!sessionId) {
    return res.status(401).json({ error: '未登录，请先授权小红书账号' });
  }
  const session = sessionStore.get(sessionId);
  if (!session?.accessToken) {
    return res.status(401).json({ error: '会话已失效，请重新登录' });
  }
  if (session.expiresAt && Date.now() > session.expiresAt) {
    return res.status(401).json({ error: '令牌已过期，请刷新或重新登录' });
  }
  req.session = session;
  next();
}

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const client = getClient();
    const { page = 1, page_size = 20 } = req.query;
    const result = await client.getNotes(req.session.accessToken, {
      page: Number(page),
      pageSize: Number(page_size),
    });
    res.json(result);
  } catch (err) {
    console.error('Get notes error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error_msg || '获取笔记列表失败',
    });
  }
});

router.get('/:noteId', async (req, res) => {
  try {
    const client = getClient();
    const result = await client.getNoteDetail(req.session.accessToken, req.params.noteId);
    res.json(result);
  } catch (err) {
    console.error('Get note detail error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error_msg || '获取笔记详情失败',
    });
  }
});

router.get('/:noteId/stats', async (req, res) => {
  try {
    const client = getClient();
    const result = await client.getNoteStats(req.session.accessToken, req.params.noteId);
    res.json(result);
  } catch (err) {
    console.error('Get note stats error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error_msg || '获取笔记数据失败',
    });
  }
});

router.get('/:noteId/comments', async (req, res) => {
  try {
    const client = getClient();
    const { page = 1, page_size = 20 } = req.query;
    const result = await client.getNoteComments(req.session.accessToken, req.params.noteId, {
      page: Number(page),
      pageSize: Number(page_size),
    });
    res.json(result);
  } catch (err) {
    console.error('Get comments error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error_msg || '获取评论失败',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const client = getClient();
    const { title, content, images } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: '标题不能为空' });
    }
    const result = await client.createNote(req.session.accessToken, { title, content, images });
    res.json(result);
  } catch (err) {
    console.error('Create note error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error_msg || '发布笔记失败',
    });
  }
});

module.exports = router;
