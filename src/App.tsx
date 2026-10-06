/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Componente Raíz de la Aplicación SPA
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MatrizView } from './components/MatrizView';
import { RenovacionesView } from './components/RenovacionesView';
import { ResumenActivosView } from './components/ResumenActivosView';
import { DetailModal } from './components/DetailModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  AppConfig, 
  DatabaseState, 
  SyncStatus, 
  MatrizRecord, 
  RenovacionRecord 
} from './types';
import { 
  getAppConfig, 
  saveAppConfig, 
  getCachedDatabase, 
  syncDatabaseFromSheets 
} from './services/apiService';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'matriz' | 'renovaciones' | 'resumen-activos'>('matriz');
  const [config, setConfig] = useState<AppConfig>(getAppConfig);
  const [db, setDb] = useState<DatabaseState>(getCachedDatabase);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Estados de Modales
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    data?: Record<string, any> | null;
    tableData?: Array<Record<string, any>> | null;
    columns?: string[];
  }>({
    isOpen: false,
    title: '',
  });

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 5000);
  };

  // Función de Sincronización en Tiempo Real
  const handleSync = async (overrideUrl?: string) => {
    const urlToUse = (overrideUrl || config.scriptUrl || '').trim();

    if (!urlToUse) {
      setSyncStatus('idle');
      showNotification('info', 'Puedes vincular la URL del Web App de Google Apps Script en Configuración para datos en tiempo real.');
      return;
    }

    setSyncStatus('syncing');
    try {
      const updatedState = await syncDatabaseFromSheets(urlToUse);
      setDb(updatedState);
      setSyncStatus('connected');
      showNotification('success', '¡Datos sincronizados exitosamente con Google Sheets!');
    } catch (err: any) {
      setSyncStatus('error');
      showNotification('error', `Fallo al sincronizar: ${err.message || 'Error de red o CORS'}`);
    }
  };

  // Sincronización automática al inicio si hay URL configurada
  useEffect(() => {
    if (config.scriptUrl && config.autoSync) {
      handleSync(config.scriptUrl);
    }
  }, []);

  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    saveAppConfig(newConfig);
    if (newConfig.scriptUrl !== config.scriptUrl && newConfig.scriptUrl) {
      handleSync(newConfig.scriptUrl);
    }
  };

  // Manejo de Modal de Registro Individual
  const handleOpenRecordDetail = (record: MatrizRecord | RenovacionRecord, type: 'matriz' | 'renovacion') => {
    const title = type === 'matriz' ? 'Detalles del Activo / Dispositivo' : 'Detalles de la Renovación de Servicio';
    const subtitle = type === 'matriz' 
      ? `Serial: ${record['SERIAL DISPOSITIVO'] || 'N/A'} - ${record['COMERCIO'] || ''}`
      : `Cliente: ${record['Clientes'] || 'N/A'}`;

    setDetailModal({
      isOpen: true,
      title,
      subtitle,
      data: record,
      tableData: null,
    });
  };

  // Manejo de Modal de Agrupación (Resumen de Activos)
  const handleOpenGroupDetail = (column: string, value: string, filteredRecords: MatrizRecord[]) => {
    setDetailModal({
      isOpen: true,
      title: `Detalle de ${column}: ${value}`,
      subtitle: `Total Registros: ${filteredRecords.length}`,
      data: null,
      tableData: filteredRecords,
      columns: ['CODIGO', 'RIF / IDEN', 'COMERCIO', 'CIUDAD', 'FECHA DE INSTALACIÓN'],
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header Corporativo con SilocomLogo */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        syncStatus={syncStatus}
        lastSyncTime={db.lastSyncTime}
        onRefresh={() => handleSync()}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Notificación Flotante / Banner Toast */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4 animate-fadeIn">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm shadow-lg ${
              notification.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                : 'bg-blue-950/60 border-blue-800 text-blue-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              {notification.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {activeTab === 'matriz' && (
          <MatrizView
            data={db.matriz}
            onOpenDetail={(row) => handleOpenRecordDetail(row, 'matriz')}
          />
        )}

        {activeTab === 'renovaciones' && (
          <RenovacionesView
            data={db.renovaciones}
            onOpenDetail={(row) => handleOpenRecordDetail(row, 'renovacion')}
          />
        )}

        {activeTab === 'resumen-activos' && (
          <ResumenActivosView
            data={db.matriz}
            onOpenGroupDetail={handleOpenGroupDetail}
          />
        )}
      </main>

      {/* Footer Corporativo */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} SILOCOM C.A. Todos los derechos reservados.</span>
          <span className="font-mono text-[11px] text-slate-600">
            Desarrollo & Arquitectura: Victor Solorzano | Google Sheets ID: {config.spreadsheetId.substring(0, 8)}...
          </span>
        </div>
      </footer>

      {/* Modal de Detalle */}
      <DetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal((prev) => ({ ...prev, isOpen: false }))}
        title={detailModal.title}
        subtitle={detailModal.subtitle}
        data={detailModal.data}
        tableData={detailModal.tableData}
        columns={detailModal.columns}
      />

      {/* Modal de Configuración */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
