"use client";

import { useState, useEffect } from "react";
import { Menu, X, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Servicios", href: "#servicios" },
  { label: "Eventos", href: "#eventos" },
  { label: "Resultados", href: "#resultados" },
  { label: "Contacto", href: "#contacto" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a
              href="#inicio"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("#inicio");
              }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-bold text-sm md:text-base leading-tight transition-colors",
                    scrolled ? "text-foreground" : "text-white"
                  )}
                >
                  VzlaBike<span className="text-orange-500"> and Run</span>
                  <sup className="text-[8px]">®</sup>
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-tight transition-colors",
                    scrolled ? "text-muted-foreground" : "text-white/70"
                  )}
                >
                  Cronometraje Deportivo
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-white/10",
                    scrolled
                      ? "text-foreground hover:bg-orange-50 hover:text-orange-600"
                      : "text-white/90 hover:text-white"
                  )}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 md:gap-3">
              <a
                href="tel:+584121234567"
                className={cn(
                  "hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors",
                  scrolled ? "text-foreground" : "text-white"
                )}
              >
                <Phone className="size-4" />
                <span className="hidden md:inline">+58 412-123-4567</span>
              </a>

              <Button
                size="sm"
                className="hidden md:inline-flex gradient-primary text-white border-0 hover:opacity-90"
                onClick={() => handleNavClick("#contacto")}
              >
                Solicitar Presupuesto
                <ChevronRight className="size-4" />
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                className={cn(
                  "lg:hidden p-2 rounded-md transition-colors",
                  scrolled
                    ? "text-foreground hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                )}
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
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="px-4 py-3 text-foreground font-medium rounded-md hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
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
