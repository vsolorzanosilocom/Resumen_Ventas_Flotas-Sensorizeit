/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Modal de Visualización Detallada para Registros y Agrupaciones
 */

import React from 'react';
import { X } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  data?: Record<string, any> | null;
  tableData?: Array<Record<string, any>> | null;
  columns?: string[];
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  data,
  tableData,
  columns,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="detail-modal"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Vista de Ficha Individual */}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(data)
                .filter(([_, val]) => val !== undefined && val !== null && String(val).trim() !== '')
                .map(([key, val]) => (
                  <div key={key} className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">
                      {key}
                    </span>
                    <span className="text-sm font-semibold text-slate-100 break-words">
                      {String(val)}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Vista de Tabla Agrupada */}
          {tableData && tableData.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                  <tr>
                    {(columns || Object.keys(tableData[0])).map((col) => (
                      <th key={col} className="p-3 border-b border-slate-800">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      {(columns || Object.keys(tableData[0])).map((col) => (
                        <td key={col} className="p-3 font-medium text-slate-200">
                          {row[col] || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="bg-slate-950/80 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
