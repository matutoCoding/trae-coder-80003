import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const titleMap: Record<string, string> = {
  '/pattern': '纹样解析',
  '/mixture': '线料搓制',
  '/coiling': '盘绕造型',
  '/records': '工艺档案',
  '/templates': '模板库',
};

export default function Layout({ children }: PropsWithChildren) {
  const location = useLocation();
  const title = titleMap[location.pathname] || '漆线雕工艺系统';

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
