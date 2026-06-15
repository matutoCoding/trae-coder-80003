import { NavLink } from 'react-router-dom';
import { Image, Scroll, Layers, FileText, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/pattern', label: '纹样解析', icon: Image },
  { path: '/mixture', label: '线料搓制', icon: Scroll },
  { path: '/coiling', label: '盘绕造型', icon: Layers },
  { path: '/records', label: '工艺档案', icon: FileText },
  { path: '/templates', label: '模板库', icon: Library },
];

export default function Sidebar() {
  return (
    <aside className="w-60 h-screen bg-ink-900 border-r border-gold-900/30 flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center justify-center border-b border-gold-900/30">
        <h1 className="text-xl font-serif font-bold text-gold-gradient">
          漆线雕工艺系统
        </h1>
      </div>
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gold-500/20 text-gold-300 border-l-2 border-gold-500 shadow-gold'
                        : 'text-ink-300 hover:bg-lacquer-800/30 hover:text-lacquer-200 hover:border-l-2 hover:border-lacquer-500'
                    )
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gold-900/30">
        <div className="text-xs text-ink-500 text-center">
          © 2024 漆线雕工艺系统
        </div>
      </div>
    </aside>
  );
}
