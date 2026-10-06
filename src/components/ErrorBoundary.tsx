/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Componente Guardián de Errores (Error Boundary)
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error no controlado capturado por ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-white">
              Ocurrió un error al cargar la aplicación
            </h2>
            
            <p className="text-xs text-slate-400">
              Se ha evitado el bloqueo de la interfaz. Puedes reiniciar los datos locales o recargar la página.
            </p>

            {this.state.error && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Limpiar Caché
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Recargar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
