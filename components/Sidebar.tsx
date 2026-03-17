import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/cashier',
    label: 'Cashier',
    icon: ShoppingCart,
  },
  {
    href: '/products',
    label: 'Products',
    icon: Package,
  },
  {
    href: '/customers',
    label: 'Customers',
    icon: Users,
  },
  {
    href: '/orders',
    label: 'Orders',
    icon: FileText,
  },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-slate-900 text-white flex flex-col z-50">
      {/* Logo / Branding */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold">
            P
          </div>
          <span className="font-semibold text-lg">POS</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = false; // You can add active state logic here

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-800">
        <p className="text-xs text-slate-400">© 2026 POS System</p>
      </div>
    </aside>
  );
}
