/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Vista de Resumen de Activos Vendidos Agrupados por Modelo y Producto
 */

import React, { useMemo } from 'react';
import { Cpu, Box, Layers, ArrowUpRight } from 'lucide-react';
import { MatrizRecord } from '../types';

interface ResumenActivosViewProps {
  data: MatrizRecord[];
  onOpenGroupDetail: (column: string, value: string, filteredRecords: MatrizRecord[]) => void;
}

export const ResumenActivosView: React.FC<ResumenActivosViewProps> = ({ data, onOpenGroupDetail }) => {
  // 1. Agrupación por Modelo de Dispositivo
  const { summaryModelos, totalModelosVendidos } = useMemo(() => {
    const summary: Record<string, { marca: string; modelo: string; total: number }> = {};
    let total = 0;

    data.forEach((row) => {
      const marca = String(row['MARCA DISPOSITIVO'] || '').trim();
      const modelo = String(row['MODELO DISPOSITIVO'] || '').trim();

      if (modelo !== '') {
        const marcaTexto = marca !== '' ? marca : 'N/A';
        const key = `${marcaTexto}||${modelo}`;

        if (!summary[key]) {
          summary[key] = { marca: marcaTexto, modelo, total: 0 };
        }
        summary[key].total += 1;
        total += 1;
      }
    });

    const sorted = Object.values(summary).sort((a, b) => b.total - a.total);
    return { summaryModelos: sorted, totalModelosVendidos: total };
  }, [data]);

  // 2. Agrupación por Nombre de Producto
  const { summaryProductos, totalProductosVendidos } = useMemo(() => {
    const summary: Record<string, number> = {};
    let total = 0;

    data.forEach((row) => {
      const prod = String(row['NOMBRE PRODUCTO'] || '').trim();
      if (prod !== '') {
        summary[prod] = (summary[prod] || 0) + 1;
        total += 1;
      }
    });

    const sorted = Object.entries(summary)
      .map(([producto, total]) => ({ producto, total }))
      .sort((a, b) => b.total - a.total);

    return { summaryProductos: sorted, totalProductosVendidos: total };
  }, [data]);

  const handleGroupClick = (column: string, value: string) => {
    const filtered = data.filter((row) => {
      const val = String(row[column] || '').trim() || 'Sin Especificar';
      return val === value;
    });
    onOpenGroupDetail(column, value, filtered);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner Resumen */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl border border-blue-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Inventario Consolidado de Activos Vendidos
            </h3>
            <p className="text-xs text-slate-400">
              Desglose dinámico clasificado por hardware y catálogo comercial
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            Modelos: <strong className="text-blue-400">{summaryModelos.length}</strong> ({totalModelosVendidos} uds.)
          </span>
          <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            Productos: <strong className="text-emerald-400">{summaryProductos.length}</strong> ({totalProductosVendidos} uds.)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tabla 1: Por Modelo de Dispositivo */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Por Modelo de Dispositivo
            </h4>
            <span className="text-[11px] text-slate-400">Total Unidades</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Marca</th>
                  <th className="p-4">Modelo Dispositivo</th>
                  <th className="p-4 text-center">Vendidos</th>
                </tr>
              </thead>
              <tbody id="tbody-resumen-modelo" className="divide-y divide-slate-800/80 bg-slate-900">
                {summaryModelos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400">
                      No se encontraron registros de modelos en la matriz.
                    </td>
                  </tr>
                ) : (
                  summaryModelos.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition">
                      <td className="p-4 font-semibold text-slate-400">
                        {item.marca}
                      </td>
                      <td className="p-4 font-medium text-white">
                        {item.modelo}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleGroupClick('MODELO DISPOSITIVO', item.modelo)}
                          title="Ver los dispositivos de este modelo"
                          className="inline-flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold transition hover:scale-105 cursor-pointer"
                        >
                          {item.total}
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla 2: Por Nombre de Producto */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-400" />
              Por Nombre de Producto
            </h4>
            <span className="text-[11px] text-slate-400">Total Unidades</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Nombre Producto</th>
                  <th className="p-4 text-center">Vendidos</th>
                </tr>
              </thead>
              <tbody id="tbody-resumen-producto" className="divide-y divide-slate-800/80 bg-slate-900">
                {summaryProductos.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-slate-400">
                      No se encontraron productos registrados en la matriz.
                    </td>
                  </tr>
                ) : (
                  summaryProductos.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition">
                      <td className="p-4 font-semibold text-white">
                        {item.producto}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleGroupClick('NOMBRE PRODUCTO', item.producto)}
                          title="Ver los dispositivos de este producto"
                          className="inline-flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold transition hover:scale-105 cursor-pointer"
                        >
                          {item.total}
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
