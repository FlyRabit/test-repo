class SessionStore {
  constructor() {
    this.sessions = new Map();
  }

  create(data) {
    const crypto = require('crypto');
    const id = crypto.randomUUID();
    this.sessions.set(id, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return id;
  }

  get(id) {
    return this.sessions.get(id) || null;
  }

  update(id, data) {
    const session = this.sessions.get(id);
    if (!session) return false;
    this.sessions.set(id, { ...session, ...data, updatedAt: Date.now() });
    return true;
  }

  delete(id) {
    return this.sessions.delete(id);
  }

  cleanup(maxAgeMs = 14 * 24 * 60 * 60 * 1000) {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.updatedAt > maxAgeMs) {
        this.sessions.delete(id);
      }
    }
  }
}

module.exports = new SessionStore();
