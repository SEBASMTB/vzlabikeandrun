"use client";

import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

const RESULTS_URL = "https://vbr-results-portal.vercel.app";

export default function ResultadosPage() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar — always visible */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-[#1A1A2E] to-black border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          {/* Back button */}
          <a
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Volver a VzlaBike and Run</span>
            <span className="sm:hidden">Volver</span>
          </a>

          {/* Title */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-semibold text-sm">
              Plataforma de Resultados
            </span>
          </div>

          {/* Open externally */}
          <a
            href={RESULTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors"
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden sm:inline">Abrir en nueva pestaña</span>
          </a>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="fixed inset-0 top-14 z-40 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando plataforma de resultados...</p>
          </div>
        </div>
      )}

      {/* Iframe — takes remaining height */}
      <iframe
        src={RESULTS_URL}
        className="flex-1 w-full border-0"
        style={{ minHeight: "calc(100vh - 56px)" }}
        onLoad={() => setLoading(false)}
        title="Plataforma de Resultados VzlaBike and Run"
      />
    </div>
  );
}
