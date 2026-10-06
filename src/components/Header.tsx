/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Encabezado Corporativo, Barra de Navegación y Estado de Sincronización
 */

import React from 'react';
import { SilocomLogo } from './SilocomLogo';
import { RefreshCw, Settings, Database, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { SyncStatus } from '../types';

interface HeaderProps {
  activeTab: 'matriz' | 'renovaciones' | 'resumen-activos';
  onTabChange: (tab: 'matriz' | 'renovaciones' | 'resumen-activos') => void;
  syncStatus: SyncStatus;
  lastSyncTime?: string;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  syncStatus,
  lastSyncTime,
  onRefresh,
  onOpenSettings,
}) => {
  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3.5">
          
          {/* Logo Corporativo & Título */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <SilocomLogo size="md" variant="badge" />
            <div className="border-l border-slate-800 pl-4">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Flotas & Sensorizeit
                <span className="hidden sm:inline-block bg-blue-500/10 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-wider">
                  Live Sheets
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Panel Corporativo de Control y Renovaciones
              </p>
            </div>
          </div>

          {/* Acciones de Sincronización y Configuración */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Indicador de Estado */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span className="text-blue-300 font-medium">Sincronizando...</span>
                </>
              ) : syncStatus === 'connected' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-300 font-medium">Sheets Conectado</span>
                  {lastSyncTime && <span className="text-slate-500">({lastSyncTime})</span>}
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-300 font-medium">Error de Red</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300 font-medium">Modo Local</span>
                  {lastSyncTime && <span className="text-slate-500">({lastSyncTime})</span>}
                </>
              )}
            </div>

            {/* Botón Refrescar */}
            <button
              id="btn-sync-refresh"
              onClick={onRefresh}
              disabled={syncStatus === 'syncing'}
              title="Sincronizar datos en tiempo real desde Google Sheets"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Botón Configuración */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              title="Configurar URL de Google Apps Script y Hoja"
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Barra de Pestañas de Navegación */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 pt-1 pb-2 overflow-x-auto">
          <button
            id="tab-btn-matriz"
            onClick={() => onTabChange('matriz')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'matriz'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Matriz de Clientes y Activos
          </button>
          <button
            id="tab-btn-renovaciones"
            onClick={() => onTabChange('renovaciones')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'renovaciones'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Control de Renovaciones
          </button>
          <button
            id="tab-btn-resumen-activos"
            onClick={() => onTabChange('resumen-activos')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'resumen-activos'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Resumen de Activos Vendidos
          </button>
        </nav>
      </div>
    </header>
  );
};
