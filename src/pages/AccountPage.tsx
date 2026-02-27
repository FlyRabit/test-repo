import { useState } from 'react';
import { useAuth } from '../store/authStore';
import { User, LogIn, LogOut, RefreshCw, AlertCircle, CheckCircle, Server, ServerOff, Loader2, Cookie, Copy } from 'lucide-react';

export default function AccountPage() {
  const { isConnected, isLoading, userInfo, error, serverOnline, loginWithCookie, logout, refreshStatus } = useAuth();
  const [cookieInput, setCookieInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConnect = async () => {
    if (!cookieInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await loginWithCookie(cookieInput.trim());
    setIsSubmitting(false);
  };

  const nickname = userInfo?.basic_info?.nickname;
  const avatar = userInfo?.basic_info?.images;
  const desc = userInfo?.basic_info?.desc;
  const redId = userInfo?.basic_info?.red_id;
  const interactions = userInfo?.interactions || [];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">账号管理</h1>

      {/* 服务器状态 */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 overflow-hidden mb-6">
        <div className="p-6 border-b border-red-50 bg-gradient-to-r from-red-50 to-pink-50">
          <h2 className="text-lg font-semibold text-gray-800">服务状态</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {serverOnline ? <Server className="text-green-500" size={20} /> : <ServerOff className="text-gray-400" size={20} />}
              <span className="text-gray-700">API 服务器</span>
            </div>
            <span className={`text-sm font-medium ${serverOnline ? 'text-green-600' : 'text-gray-400'}`}>
              {isLoading ? '检测中...' : serverOnline ? '已连接' : '未启动'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cookie className={isConnected ? 'text-green-500' : 'text-gray-400'} size={20} />
              <span className="text-gray-700">SDK 引擎</span>
            </div>
            <span className="text-xs text-gray-400">ReaJason/xhs (Cookie 认证)</span>
          </div>

          {!serverOnline && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-medium mb-2">API 服务器未启动</p>
              <p>请在新终端中运行：</p>
              <code className="block mt-2 p-2 bg-amber-100 rounded text-xs">npm run dev:server</code>
            </div>
          )}
        </div>
      </div>

      {/* 账号连接 */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 overflow-hidden mb-6">
        <div className="p-6 border-b border-red-50 bg-gradient-to-r from-red-50 to-pink-50">
          <h2 className="text-lg font-semibold text-gray-800">小红书账号</h2>
        </div>
        <div className="p-6">
          {isConnected && userInfo ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {avatar ? (
                  <img src={avatar} alt="" className="w-16 h-16 rounded-full border-2 border-red-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#fe2c55] to-[#ff6b9d] flex items-center justify-center">
                    <User className="text-white" size={28} />
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-gray-800">{nickname || '小红书用户'}</p>
                  {redId && <p className="text-xs text-gray-400 mt-0.5">小红书号: {redId}</p>}
                  {desc && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{desc}</p>}
                </div>
              </div>

              {interactions.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {interactions.map((item, i) => (
                    <div key={i} className="text-center p-3 bg-red-50 rounded-xl">
                      <p className="text-xl font-bold text-[#fe2c55]">{item.count || '0'}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.name || item.type}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={refreshStatus} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <RefreshCw size={16} /> 刷新状态
                </button>
                <button onClick={logout} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-[#fe2c55] rounded-xl hover:bg-red-100 transition-colors">
                  <LogOut size={16} /> 断开连接
                </button>
              </div>
            </div>
          ) : isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={24} />
                <p className="text-gray-800 font-medium">账号已连接</p>
              </div>
              <div className="flex gap-3">
                <button onClick={refreshStatus} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <RefreshCw size={16} /> 刷新
                </button>
                <button onClick={logout} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-[#fe2c55] rounded-xl hover:bg-red-100 transition-colors">
                  <LogOut size={16} /> 断开
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-500">
                <User size={24} />
                <p>尚未连接小红书账号</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">粘贴小红书 Cookie</label>
                <textarea
                  value={cookieInput}
                  onChange={e => setCookieInput(e.target.value)}
                  placeholder="从浏览器开发者工具复制 Cookie 后粘贴到此处..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-red-100 focus:border-[#fe2c55] focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none text-sm font-mono"
                />
              </div>
              <button
                onClick={handleConnect}
                disabled={!serverOnline || !cookieInput.trim() || isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#fe2c55] text-white rounded-xl hover:bg-[#e01a45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? (
                  <><Loader2 size={20} className="animate-spin" /> 连接中...</>
                ) : (
                  <><LogIn size={20} /> 连接小红书账号</>
                )}
              </button>
              {!serverOnline && (
                <p className="text-xs text-gray-400 text-center">请先启动 API 服务器</p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cookie 获取教程 */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 overflow-hidden">
        <div className="p-6 border-b border-red-50">
          <h2 className="text-lg font-semibold text-gray-800">如何获取 Cookie</h2>
        </div>
        <div className="p-6">
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>在 Chrome 浏览器中打开 <a href="https://www.xiaohongshu.com" target="_blank" rel="noreferrer" className="text-[#fe2c55] underline">小红书网页版</a> 并登录你的账号</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>按 <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs border border-gray-200">F12</kbd> 打开开发者工具</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>切换到 <strong>Application</strong>（应用）标签页</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>在左侧找到 <strong>Cookies → https://www.xiaohongshu.com</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
              <div>
                <span>或者切换到 <strong>Network</strong>（网络）标签页，刷新页面，点击任意请求，在 Headers 中找到 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">Cookie</code> 字段</span>
                <div className="flex items-center gap-2 mt-2">
                  <Copy size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-400">复制完整的 Cookie 字符串</span>
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
              <span>将复制的 Cookie 粘贴到上方输入框，点击"连接小红书账号"</span>
            </li>
          </ol>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
            <p><strong>安全提示：</strong>Cookie 仅保存在本地服务器内存中，不会上传到任何第三方。关闭服务器后自动清除。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
