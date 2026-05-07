"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  LogOut,
  Menu,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Eventos",
    href: "/admin/eventos",
    icon: CalendarDays,
  },
  {
    label: "Inscripciones",
    href: "/admin/inscripciones",
    icon: ClipboardList,
  },
];

function checkAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("admin_token=");
}

function useAuthState() {
  const [authState, setAuthState] = useState<{
    checked: boolean;
    authenticated: boolean;
  }>({ checked: false, authenticated: false });

  const checkAndSet = useCallback(() => {
    const hasToken = checkAuthCookie();
    setAuthState({ checked: true, authenticated: hasToken });
    return hasToken;
  }, []);

  return { authState, checkAndSet };
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Fallback: clear cookie manually
      document.cookie = "admin_token=; path=/; max-age=0";
    }
    router.push("/admin/login");
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" onClick={onNavigate}>
          <img
            src="/LOGOVBR.png"
            alt="VzlaBike and Run"
            className="h-10 w-auto brightness-0 invert"
          />
        </Link>
        <p className="text-white/50 text-xs mt-2 font-medium tracking-wider uppercase">
          Panel Admin
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className="size-5 shrink-0" />
              <span>{link.label}</span>
              {isActive && (
                <ChevronRight className="size-4 ml-auto opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 w-full"
        >
          <LogOut className="size-5 shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { authState, checkAndSet } = useAuthState();
  const redirectAttempted = useRef(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return; // Skip auth check on login page
    if (redirectAttempted.current) return;
    redirectAttempted.current = true;

    // Use a microtask to defer the check (subscription callback pattern)
    const id = requestAnimationFrame(() => {
      const hasToken = checkAndSet();
      if (!hasToken) {
        router.replace("/admin/login");
      }
    });

    return () => cancelAnimationFrame(id);
  }, [router, checkAndSet, isLoginPage]);

  // Login page: render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authState.checked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin size-8 text-red-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authState.authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 gradient-dark fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="gradient-dark border-0 p-0 w-72 sm:max-w-xs [&>button]:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de navegación</SheetTitle>
          </SheetHeader>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b shadow-sm">
          <div className="flex items-center gap-3 px-4 h-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </Button>
            <img
              src="/LOGOVBR.png"
              alt="VzlaBike"
              className="h-7 w-auto"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
