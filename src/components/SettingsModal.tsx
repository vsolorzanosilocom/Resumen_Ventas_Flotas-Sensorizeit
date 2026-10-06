/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Modal de Configuración de API y Conexión en Vivo con Google Sheets
 */

import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ExternalLink, Link2, Key, Info } from 'lucide-react';
import { AppConfig } from '../types';
import { testConnection } from '../services/apiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [scriptUrl, setScriptUrl] = useState(config.scriptUrl);
  const [spreadsheetId, setSpreadsheetId] = useState(config.spreadsheetId);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection(scriptUrl);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Error al probar conexión' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      scriptUrl: scriptUrl.trim(),
      spreadsheetId: spreadsheetId.trim(),
    });
    onClose();
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-lg text-white">Configuración de Conexión en Vivo</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-5 text-sm">
          {/* Instrucciones Breves */}
          <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-200">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-100 mb-1">Conexión con Google Sheets:</p>
              <p>
                Los datos se sincronizan directamente con el archivo oficial. Si despliegas el script{' '}
                <code className="bg-blue-900/60 px-1 py-0.5 rounded text-blue-300">Codigo_API.gs</code> como Web App (acceso: Cualquier usuario), pega la URL generada aquí.
              </p>
            </div>
          </div>

          {/* Input URL Web App */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              URL del Web App (Google Apps Script)
            </label>
            <input
              type="text"
              id="input-script-url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={scriptUrl}
              onChange={(e) => setScriptUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
          </div>

          {/* Input Spreadsheet ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>ID de la Hoja de Cálculo (Google Sheets)</span>
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1 font-normal lowercase"
              >
                abrir en sheets <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="text"
              id="input-spreadsheet-id"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
          </div>

          {/* Resultado de Prueba */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Pie con Acciones */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-between items-center">
          <button
            type="button"
            id="btn-test-connection"
            onClick={handleTest}
            disabled={isTesting || !scriptUrl.trim()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            {isTesting ? 'Probando...' : 'Probar Conexión'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-save-settings"
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md transition cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
