'use client';

import { Bell, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from '@/components/Sidebar';
import { useState } from 'react';

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
          <Settings className="w-5 h-5" />
        </Button>
        <LanguageSwitcher />
        
        {/* User Avatar */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
          JA
        </div>
      </div>
    </nav>
  );
}
