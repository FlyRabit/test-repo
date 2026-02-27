import { NavLink, Outlet } from 'react-router-dom';
import { FileEdit, Image, Send, BarChart3, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../store/authStore';
import type { NavItem } from '../types';

const navItems: { key: NavItem; label: string; icon: React.ReactNode; path: string }[] = [
  { key: 'editor', label: '文案编辑', icon: <FileEdit size={20} />, path: '/' },
  { key: 'images', label: '图片排版', icon: <Image size={20} />, path: '/images' },
  { key: 'publish', label: '一键发布', icon: <Send size={20} />, path: '/publish' },
  { key: 'dashboard', label: '数据图表', icon: <BarChart3 size={20} />, path: '/dashboard' },
];

export default function Layout() {
  const { isConnected, userInfo } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-white/90 backdrop-blur shadow-lg border-r border-red-100 flex flex-col">
        <div className="p-6 border-b border-red-50">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fe2c55] to-[#ff6b9d] flex items-center justify-center">
              <span className="text-white font-bold text-lg">红</span>
            </div>
            <span className="font-semibold text-lg text-gray-800">运营系统</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ key, label, icon, path }) => (
            <NavLink
              key={key}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#fe2c55] text-white shadow-md shadow-red-200'
                    : 'text-gray-600 hover:bg-red-50 hover:text-[#fe2c55]'
                }`
              }
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-red-50">
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#fe2c55] text-white shadow-md shadow-red-200'
                  : 'text-gray-600 hover:bg-red-50 hover:text-[#fe2c55]'
              }`
            }
          >
            {isConnected ? (
              <>
                {userInfo?.basic_info?.images ? (
                  <img src={userInfo.basic_info.images} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <CheckCircle size={20} />
                )}
                <span className="truncate">{userInfo?.basic_info?.nickname || '已连接'}</span>
              </>
            ) : (
              <>
                <User size={20} />
                <span>账号管理</span>
              </>
            )}
          </NavLink>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
