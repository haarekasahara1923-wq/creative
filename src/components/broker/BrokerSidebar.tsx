'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, User, DollarSign, CreditCard, LogOut, ExternalLink, Building2 } from 'lucide-react';

interface BrokerSidebarProps { brokerId: string; brokerName: string; }

const navItems = [
  { href: '/broker', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/broker/profile', label: 'My Profile', icon: User },
  { href: '/broker/earnings', label: 'My Earnings', icon: DollarSign },
  { href: '/broker/withdrawals', label: 'Withdrawals', icon: CreditCard },
];

export default function BrokerSidebar({ brokerId, brokerName }: BrokerSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string, exact = false) => exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 p-1.5 rounded-lg">
            <Building2 className="h-5 w-5 text-slate-900" />
          </div>
          <div>
            <span className="text-white font-bold">Creative</span>
            <span className="text-amber-500 font-bold"> Group</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">
            {brokerName[0]?.toUpperCase()}
          </div>
          <div className="text-xs text-gray-400 truncate">{brokerName}</div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(href, exact) ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="h-4 w-4" />{label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <ExternalLink className="h-4 w-4" />View Website
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-4 w-4" />Sign Out
        </button>
      </div>
    </aside>
  );
}
