import { useAuth } from '../store/authStore';
import { User, LogIn, LogOut, RefreshCw, AlertCircle, CheckCircle, Server, ServerOff } from 'lucide-react';

export default function AccountPage() {
  const { isConnected, isConfigured, isLoading, userInfo, error, serverOnline, login, logout, refreshStatus } = useAuth();

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
              {serverOnline ? (
                <Server className="text-green-500" size={20} />
              ) : (
                <ServerOff className="text-gray-400" size={20} />
              )}
              <span className="text-gray-700">API 服务器</span>
            </div>
            <span className={`text-sm font-medium ${serverOnline ? 'text-green-600' : 'text-gray-400'}`}>
              {isLoading ? '检测中...' : serverOnline ? '已连接' : '未启动'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConfigured ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <AlertCircle className="text-amber-500" size={20} />
              )}
              <span className="text-gray-700">API 凭证</span>
            </div>
            <span className={`text-sm font-medium ${isConfigured ? 'text-green-600' : 'text-amber-600'}`}>
              {isConfigured ? '已配置' : '未配置'}
            </span>
          </div>

          {!serverOnline && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-medium mb-2">API 服务器未启动</p>
              <p>请先启动后端服务器：</p>
              <code className="block mt-2 p-2 bg-amber-100 rounded text-xs">
                cd server && npm run dev
              </code>
            </div>
          )}

          {serverOnline && !isConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-medium mb-2">未配置小红书 API 凭证</p>
              <p>请在项目根目录的 <code>.env</code> 文件中配置：</p>
              <code className="block mt-2 p-2 bg-amber-100 rounded text-xs whitespace-pre">
{`XHS_APP_KEY=你的AppKey
XHS_APP_SECRET=你的AppSecret`}
              </code>
              <p className="mt-2">
                前往 <a href="https://open.xiaohongshu.com" target="_blank" rel="noreferrer" className="underline text-amber-900">
                  小红书开放平台
                </a> 申请开发者凭证。
              </p>
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
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt="" className="w-16 h-16 rounded-full border-2 border-red-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#fe2c55] to-[#ff6b9d] flex items-center justify-center">
                    <User className="text-white" size={28} />
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-gray-800">{userInfo.nickname || '小红书用户'}</p>
                  {userInfo.desc && <p className="text-sm text-gray-500 mt-1">{userInfo.desc}</p>}
                </div>
              </div>

              {(userInfo.fans_count !== undefined || userInfo.notes_count !== undefined) && (
                <div className="grid grid-cols-3 gap-4">
                  {userInfo.notes_count !== undefined && (
                    <div className="text-center p-3 bg-red-50 rounded-xl">
                      <p className="text-xl font-bold text-[#fe2c55]">{userInfo.notes_count}</p>
                      <p className="text-xs text-gray-500 mt-1">笔记</p>
                    </div>
                  )}
                  {userInfo.fans_count !== undefined && (
                    <div className="text-center p-3 bg-red-50 rounded-xl">
                      <p className="text-xl font-bold text-[#fe2c55]">{userInfo.fans_count}</p>
                      <p className="text-xs text-gray-500 mt-1">粉丝</p>
                    </div>
                  )}
                  {userInfo.follows_count !== undefined && (
                    <div className="text-center p-3 bg-red-50 rounded-xl">
                      <p className="text-xl font-bold text-[#fe2c55]">{userInfo.follows_count}</p>
                      <p className="text-xs text-gray-500 mt-1">关注</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={refreshStatus}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw size={16} />
                  刷新状态
                </button>
                <button
                  onClick={logout}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-[#fe2c55] rounded-xl hover:bg-red-100 transition-colors"
                >
                  <LogOut size={16} />
                  断开连接
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
                <button
                  onClick={refreshStatus}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw size={16} />
                  刷新状态
                </button>
                <button
                  onClick={logout}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-[#fe2c55] rounded-xl hover:bg-red-100 transition-colors"
                >
                  <LogOut size={16} />
                  断开连接
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-500">
                <User size={24} />
                <p>尚未连接小红书账号</p>
              </div>

              <button
                onClick={login}
                disabled={!serverOnline || !isConfigured}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#fe2c55] text-white rounded-xl hover:bg-[#e01a45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <LogIn size={20} />
                授权连接小红书账号
              </button>

              {!serverOnline || !isConfigured ? (
                <p className="text-xs text-gray-400 text-center">
                  请先完成上方的服务配置后再连接账号
                </p>
              ) : (
                <p className="text-xs text-gray-400 text-center">
                  点击后将跳转到小红书授权页面，授权后自动返回
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <p className="font-medium">错误</p>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 overflow-hidden">
        <div className="p-6 border-b border-red-50">
          <h2 className="text-lg font-semibold text-gray-800">接入指南</h2>
        </div>
        <div className="p-6">
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>前往 <a href="https://open.xiaohongshu.com" target="_blank" rel="noreferrer" className="text-[#fe2c55] underline">小红书开放平台</a> 注册开发者账号</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>创建应用并获取 App Key 和 App Secret</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>在应用中配置回调地址为：<code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">http://localhost:3001/api/auth/callback</code></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>将凭证填入项目根目录的 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env</code> 文件</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
              <span>启动 API 服务器：<code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">cd server && npm run dev</code></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#fe2c55] text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
              <span>点击上方"授权连接小红书账号"完成绑定</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
