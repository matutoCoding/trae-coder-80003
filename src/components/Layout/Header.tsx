import { Settings, User } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 bg-ink-900/80 backdrop-blur-sm border-b border-gold-500/30 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-ivory-100">{title}</h2>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md text-ink-400 hover:text-gold-400 hover:bg-gold-500/10 transition-all duration-200">
          <Settings size={20} />
        </button>
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-ink-800/50 border border-gold-900/30">
          <div className="w-8 h-8 rounded-full bg-lacquer-gradient flex items-center justify-center">
            <User size={16} className="text-ivory-100" />
          </div>
          <span className="text-sm text-ivory-200">工艺师</span>
        </div>
      </div>
    </header>
  );
}
