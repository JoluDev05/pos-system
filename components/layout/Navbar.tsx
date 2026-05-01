'use client';

import { Bell, Menu, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from '@/components/layout/Sidebar';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabaseBrowser.auth.signOut();
    } catch (err) {
      // ignore errors for now
    }
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-40">
      <div className="flex items-center gap-3">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 bg-slate-900 text-white border-slate-800"
          >
            <Sidebar
              variant="mobile"
              onNavigate={() => setIsMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <h1 className="text-base sm:text-xl font-semibold text-slate-900">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="text-slate-600">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-600">
          <SettingsIcon className="w-5 h-5" />
        </Button>
        <LanguageSwitcher />
        
        {/* User Avatar + Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="p-0">
              <Avatar>
                <AvatarFallback>JA</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <SettingsIcon className="mr-2" /> Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} data-variant="destructive">
              <LogOut className="mr-2" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
