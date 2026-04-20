"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Rss,
  Layers,
  Bookmark,
  Settings,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return "flex items-center gap-3 py-3 px-4 rounded-lg bg-gradient-to-r from-primary-container/20 to-transparent text-primary border-r-2 border-primary-container font-headline text-sm tracking-wide uppercase group";
    }
    return "flex items-center gap-3 py-3 px-4 rounded-lg text-slate-500 hover:text-on-surface hover:bg-surface-container transition-all font-headline text-sm tracking-wide uppercase group";
  };

  const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/feed", icon: Rss, label: "Feed" },
    { href: "/dashboard/sources", icon: Layers, label: "Sources" },
    { href: "/dashboard/saved", icon: Bookmark, label: "Saved" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const SidebarContent = () => (
    <>
      <div className="mb-10 px-4">
        <Link href="/" onClick={() => setSidebarOpen(false)}>
          <h1 className="text-lg font-black text-surface-tint font-headline tracking-wide uppercase">
            OneStream
          </h1>
        </Link>
        <p className="font-headline text-xs tracking-widest uppercase text-slate-500 mt-1">
          Intelligence Platform
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {navLinks.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={getLinkClasses(href)}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="group-hover:translate-x-1 duration-300">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <div className="h-screen w-full flex bg-surface overflow-hidden">
      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex-col py-8 px-4 z-50 border-r border-outline-variant/10">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay Sidebar ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-surface-container-low flex flex-col py-8 px-4 z-50 border-r border-outline-variant/10 transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-on-surface p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 md:ml-64 flex flex-col relative h-screen">
        {/* Mobile Top Bar */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/10 flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-on-surface p-2 -ml-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/">
            <span className="text-sm font-black text-surface-tint font-headline tracking-wide uppercase">
              OneStream
            </span>
          </Link>
        </div>

        {/* Page content — push down on mobile for the top bar */}
        <div className="flex-1 overflow-hidden md:mt-0 mt-14">
          {children}
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 md:left-64 right-0 bg-surface-container-lowest border-t border-outline-variant/15 h-10 z-30">
          <div className="h-full max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
            <p className="font-body text-[10px] text-slate-600">
              © 2025 OneStream Intelligence. All rights reserved.
            </p>
            <div className="hidden sm:flex gap-4">
              <Link href="#" className="font-body text-[10px] text-slate-600 hover:text-primary transition-colors duration-200">Privacy</Link>
              <Link href="#" className="font-body text-[10px] text-slate-600 hover:text-primary transition-colors duration-200">Terms</Link>
              <Link href="#" className="font-body text-[10px] text-slate-600 hover:text-primary transition-colors duration-200">API</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
