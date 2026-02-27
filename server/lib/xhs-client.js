const crypto = require('crypto');
const axios = require('axios');

const XHS_API_BASE = 'https://ark.xiaohongshu.com';

function generateSign(path, params, appSecret) {
  const sortedKeys = Object.keys(params).sort();
  const paramStr = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
  const signStr = `${path}?${paramStr}${appSecret}`;
  return crypto.createHash('md5').update(signStr).digest('hex');
}

function buildHeaders(path, queryParams, appKey, appSecret) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const allParams = { ...queryParams, 'app-key': appKey, timestamp };
  const sign = generateSign(path, allParams, appSecret);
  return {
    'app-key': appKey,
    timestamp,
    sign,
    'Content-Type': 'application/json',
  };
}

class XhsClient {
  constructor(appKey, appSecret) {
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.client = axios.create({ baseURL: XHS_API_BASE, timeout: 15000 });
  }

  getAuthorizationUrl(redirectUri, state) {
    const params = new URLSearchParams({
      app_id: this.appKey,
      response_type: 'code',
      redirect_uri: redirectUri,
      state: state || crypto.randomUUID(),
    });
    return `${XHS_API_BASE}/ark/authorization?${params.toString()}`;
  }

  async getAccessToken(code) {
    const path = '/ark/open_api/v0/oauth/token';
    const body = {
      app_id: this.appKey,
      app_secret: this.appSecret,
      code,
      grant_type: 'authorization_code',
    };
    const headers = buildHeaders(path, {}, this.appKey, this.appSecret);
    const res = await this.client.post(path, body, { headers });
    return res.data;
  }

  async refreshToken(refreshToken) {
    const path = '/ark/open_api/v0/oauth/token/refresh';
    const body = {
      app_id: this.appKey,
      app_secret: this.appSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };
    const headers = buildHeaders(path, {}, this.appKey, this.appSecret);
    const res = await this.client.post(path, body, { headers });
    return res.data;
  }

  async request(method, path, { accessToken, params = {}, body = null } = {}) {
    const queryParams = { ...params };
    if (accessToken) {
      queryParams.access_token = accessToken;
    }
    const headers = buildHeaders(path, queryParams, this.appKey, this.appSecret);
    const config = {
      method,
      url: path,
      headers,
      params: queryParams,
    };
    if (body && (method === 'POST' || method === 'PUT')) {
      config.data = body;
    }
    const res = await this.client(config);
    return res.data;
  }

  async getUserInfo(accessToken) {
    return this.request('GET', '/ark/open_api/v1/user/info', { accessToken });
  }

  async getNotes(accessToken, { page = 1, pageSize = 20 } = {}) {
    return this.request('GET', '/ark/open_api/v1/notes', {
      accessToken,
      params: { page, page_size: pageSize },
    });
  }

  async getNoteDetail(accessToken, noteId) {
    return this.request('GET', `/ark/open_api/v1/notes/${noteId}`, { accessToken });
  }

  async getNoteStats(accessToken, noteId) {
    return this.request('GET', `/ark/open_api/v1/notes/${noteId}/stats`, { accessToken });
  }

  async getNoteComments(accessToken, noteId, { page = 1, pageSize = 20 } = {}) {
    return this.request('GET', `/ark/open_api/v1/notes/${noteId}/comments`, {
      accessToken,
      params: { page, page_size: pageSize },
    });
  }

  async createNote(accessToken, { title, content, images = [] }) {
    return this.request('POST', '/ark/open_api/v1/notes', {
      accessToken,
      body: { title, content, images },
    });
  }

  async uploadImage(accessToken, imageBuffer, filename) {
    const path = '/ark/open_api/v1/media/upload';
    const headers = buildHeaders(path, { access_token: accessToken }, this.appKey, this.appSecret);
    const FormData = require('form-data') || null;
    headers['Content-Type'] = 'multipart/form-data';
    const formData = new (require('form-data'))();
    formData.append('file', imageBuffer, { filename });
    formData.append('access_token', accessToken);
    const res = await this.client.post(path, formData, {
      headers: { ...headers, ...formData.getHeaders() },
    });
    return res.data;
  }
}

module.exports = { XhsClient, generateSign, XHS_API_BASE };
