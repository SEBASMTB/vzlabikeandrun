"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Servicios", href: "#servicios" },
  { label: "Eventos", href: "#eventos" },
  { label: "Tienda", href: "/tienda" },
  { label: "Resultados", href: "https://vbr-results-portal.vercel.app", external: true },
  { label: "Contacto", href: "#contacto" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHomePage = pathname === "/";

  const handleNavClick = (href: string, external?: boolean) => {
    setMobileOpen(false);
    if (external) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    if (href.startsWith("/")) {
      router.push(href);
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a
              href={isHomePage ? "#inicio" : "/"}
              onClick={(e) => {
                e.preventDefault();
                if (isHomePage) {
                  handleNavClick("#inicio");
                } else {
                  router.push("/");
                }
              }}
              className="flex items-center"
            >
              <img
                src="/LOGOVBR.png"
                alt="VzlaBike and Run"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isPage = link.href.startsWith("/");
                const isTienda = isPage && pathname === link.href;
                const isExternal = (link as any).external;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href, isExternal);
                    }}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isTienda
                        ? "text-red-400"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 md:gap-3">
              <a
                href="tel:+584120162685"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                <Phone className="size-4" />
                <span className="hidden md:inline">+58 412-016-2685</span>
              </a>

              <Button
                size="sm"
                className="hidden md:inline-flex gradient-primary text-white border-0 hover:opacity-90"
                onClick={() => {
                  if (isHomePage) handleNavClick("#contacto");
                  else {
                    router.push("/");
                    setTimeout(() => {
                      const el = document.querySelector("#contacto");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }, 300);
                  }
                }}
              >
                Solicitar Presupuesto
                <ChevronRight className="size-4" />
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute top-16 right-0 left-0 bg-white shadow-xl border-b">
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => {
                  const isPage = link.href.startsWith("/");
                  const isExternal = (link as any).external;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link.href, isExternal);
                      }}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className={cn(
                        "px-4 py-3 font-medium rounded-md transition-colors",
                        isPage
                          ? "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          : "text-foreground hover:bg-red-50 hover:text-red-600"
                      )}
                    >
                      {link.label}
                    </a>
                  );
                })}
                <div className="border-t mt-2 pt-3">
                  <Button
                    className="w-full gradient-primary text-white border-0"
                    onClick={() => handleNavClick("#contacto")}
                  >
                    Solicitar Presupuesto
                  </Button>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
