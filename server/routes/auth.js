const { Router } = require('express');
const { XhsClient } = require('../lib/xhs-client');
const sessionStore = require('../lib/session-store');

const router = Router();

function getClient() {
  return new XhsClient(process.env.XHS_APP_KEY, process.env.XHS_APP_SECRET);
}

function getRedirectUri() {
  return process.env.XHS_REDIRECT_URI || 'http://localhost:3001/api/auth/callback';
}

router.get('/login', (req, res) => {
  const client = getClient();
  const crypto = require('crypto');
  const state = crypto.randomUUID();
  const url = client.getAuthorizationUrl(getRedirectUri(), state);
  res.json({ url, state });
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    return res.redirect('/?auth_error=no_code');
  }

  try {
    const client = getClient();
    const tokenData = await client.getAccessToken(code);

    if (tokenData.error_code && tokenData.error_code !== 0) {
      console.error('Token exchange failed:', tokenData);
      return res.redirect(`/?auth_error=${encodeURIComponent(tokenData.error_msg || 'token_failed')}`);
    }

    const data = tokenData.data || tokenData;
    const sessionId = sessionStore.create({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in || 7 * 24 * 3600) * 1000,
      userId: data.user_id || '',
    });

    let userInfo = null;
    try {
      const userRes = await client.getUserInfo(data.access_token);
      userInfo = userRes.data || userRes;
    } catch (e) {
      console.warn('Failed to fetch user info:', e.message);
    }

    if (userInfo) {
      sessionStore.update(sessionId, { userInfo });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/account?session=${sessionId}`);
  } catch (err) {
    console.error('OAuth callback error:', err.response?.data || err.message);
    res.redirect(`/?auth_error=${encodeURIComponent(err.message)}`);
  }
});

router.get('/status', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.cookies?.xhs_session;
  if (!sessionId) {
    return res.json({ authenticated: false });
  }

  const session = sessionStore.get(sessionId);
  if (!session) {
    return res.json({ authenticated: false });
  }

  const isExpired = session.expiresAt && Date.now() > session.expiresAt;
  res.json({
    authenticated: !isExpired,
    expired: isExpired,
    userInfo: session.userInfo || null,
    userId: session.userId || null,
  });
});

router.post('/refresh', async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.cookies?.xhs_session;
  if (!sessionId) {
    return res.status(401).json({ error: '未登录' });
  }

  const session = sessionStore.get(sessionId);
  if (!session?.refreshToken) {
    return res.status(401).json({ error: '会话无效' });
  }

  try {
    const client = getClient();
    const tokenData = await client.refreshToken(session.refreshToken);
    const data = tokenData.data || tokenData;

    sessionStore.update(sessionId, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || session.refreshToken,
      expiresAt: Date.now() + (data.expires_in || 7 * 24 * 3600) * 1000,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Token refresh error:', err.response?.data || err.message);
    res.status(500).json({ error: '刷新令牌失败' });
  }
});

router.post('/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.cookies?.xhs_session;
  if (sessionId) {
    sessionStore.delete(sessionId);
  }
  res.json({ success: true });
});

module.exports = router;
