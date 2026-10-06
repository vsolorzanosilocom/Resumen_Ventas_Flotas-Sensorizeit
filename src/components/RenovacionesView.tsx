/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Vista de Control y Gestión de Renovaciones de Servicios
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Eye, 
  PieChart as PieIcon, 
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { RenovacionRecord } from '../types';

interface RenovacionesViewProps {
  data: RenovacionRecord[];
  onOpenDetail: (record: RenovacionRecord) => void;
}

export const RenovacionesView: React.FC<RenovacionesViewProps> = ({ data, onOpenDetail }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const pieChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const pieChartInstance = useRef<Chart | null>(null);
  const barChartInstance = useRef<Chart | null>(null);

  const cleanCurrency = (val: any): number => {
    if (!val) return 0;
    const clean = String(val).replace(/[^0-9.-]+/g, '');
    return parseFloat(clean) || 0;
  };

  // 1. Cálculos de KPIs
  const kpis = useMemo(() => {
    let mrr = 0;
    let cobrar = 0;
    let okCount = 0;

    data.forEach((row) => {
      const tarifa = cleanCurrency(row['Tárifa Mensual $$']);
      const accion = String(row['Acción'] || '').toUpperCase().trim();

      mrr += tarifa;
      if (accion === 'COBRAR') {
        cobrar += cleanCurrency(row['Tárifa de renovacion $$']) || tarifa;
      } else if (accion === 'OK') {
        okCount += 1;
      }
    });

    return { mrr, cobrar, okCount };
  }, [data]);

  // 2. Filtrado de Datos
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return data.filter((row) => {
      let matchQuery = true;
      if (q !== '') {
        const cli = String(row['Clientes'] || '').toLowerCase();
        const loc = String(row['Localidad'] || '').toLowerCase();
        const acc = String(row['Acción'] || '').toLowerCase();
        const serv = String(row['Servicio'] || '').toLowerCase();
        matchQuery = cli.includes(q) || loc.includes(q) || acc.includes(q) || serv.includes(q);
      }

      const matchAction = selectedAction === '' || String(row['Acción'] || '').toUpperCase().trim() === selectedAction;
      return matchQuery && matchAction;
    });
  }, [data, searchQuery, selectedAction]);

  // 3. Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // 4. Renderizado de Gráficos (Chart.js)
  useEffect(() => {
    // Gráfico de Servicios (Pie)
    if (pieChartRef.current) {
      if (pieChartInstance.current) pieChartInstance.current.destroy();

      const servicios: Record<string, number> = {};
      data.forEach((row) => {
        const serv = String(row['Servicio'] || 'Otro').trim();
        servicios[serv] = (servicios[serv] || 0) + 1;
      });

      pieChartInstance.current = new Chart(pieChartRef.current, {
        type: 'pie',
        data: {
          labels: Object.keys(servicios),
          datasets: [
            {
              data: Object.values(servicios),
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
              borderColor: '#0f172a',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#334155', font: { size: 10 } },
            },
          },
        },
      });
    }

    // Top 5 Clientes por Facturación (Bar)
    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();

      const clientBilling: Record<string, number> = {};
      data.forEach((row) => {
        const cli = String(row['Clientes'] || 'Otros').trim();
        clientBilling[cli] = (clientBilling[cli] || 0) + cleanCurrency(row['Tárifa Mensual $$']);
      });

      const sortedClients = Object.entries(clientBilling)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      barChartInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: sortedClients.map(([name]) => name.length > 16 ? name.substring(0, 16) + '...' : name),
          datasets: [
            {
              label: 'Facturación ($)',
              data: sortedClients.map(([_, amount]) => amount),
              backgroundColor: '#3b82f6',
              hoverBackgroundColor: '#2563eb',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#64748b', font: { size: 10 } },
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(226, 232, 240, 0.8)' },
              ticks: { color: '#64748b', font: { size: 10 } },
            },
          },
        },
      });
    }

    return () => {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
    };
  }, [data]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Tarjetas de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Facturación Mensual (MRR)
            </p>
            <h3 id="kpi-renovaciones-mrr" className="text-3xl font-black text-slate-900 mt-1">
              ${kpis.mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl border border-blue-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Por Cobrar / Pendiente
            </p>
            <h3 id="kpi-renovaciones-cobrar" className="text-3xl font-black text-rose-600 mt-1">
              ${kpis.cobrar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="bg-rose-50 text-rose-600 p-3.5 rounded-xl border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Servicios Renovados (OK)
            </p>
            <h3 id="kpi-renovaciones-ok" className="text-3xl font-black text-emerald-600 mt-1">
              {kpis.okCount}
            </h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. Gráficos Analíticos de Renovación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-600" />
              Distribución por Tipo de Servicio
            </h4>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            <canvas ref={pieChartRef}></canvas>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Top Clientes por Facturación Mensual ($)
            </h4>
          </div>
          <div className="h-64 relative">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* 3. Tabla de Renovaciones */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Barra de Filtros */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="search-renovaciones"
              placeholder="Buscar por Cliente, Localidad o Servicio..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              id="filter-renovaciones-action"
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="">Todas las Acciones</option>
              <option value="OK">OK (Al Día)</option>
              <option value="COBRAR">COBRAR (Pendiente)</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Localidad</th>
                <th className="p-4">Condición</th>
                <th className="p-4">Próxima Renovación</th>
                <th className="p-4">Estatus / Acción</th>
                <th className="p-4">Monto Mensual</th>
                <th className="p-4 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody id="tbody-renovaciones" className="divide-y divide-slate-100 bg-white">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    No se encontraron registros de renovación coincidentes.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const accion = String(row['Acción'] || '').toUpperCase().trim();
                  const tarifa = cleanCurrency(row['Tárifa Mensual $$']);
                  const isCobrar = accion === 'COBRAR';
                  const isOk = accion === 'OK';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-semibold text-slate-900">
                        {row['Clientes'] || 'N/A'}
                      </td>
                      <td className="p-4 text-slate-500 text-xs">
                        {row['Localidad'] || 'N/A'}
                      </td>
                      <td className="p-4 text-slate-600 text-xs">
                        {row['Condiciones'] || 'N/A'}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500">
                        {row['Fecha de próxima renovación (vencimiento servicio)'] || 'N/A'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                            isCobrar
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              : isOk
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isCobrar && <AlertCircle className="w-3 h-3" />}
                          {isOk && <CheckCircle2 className="w-3 h-3" />}
                          {accion || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900 font-mono">
                        ${tarifa.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onOpenDetail(row)}
                          title="Ver detalle completo de renovación"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 p-2 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredData.length > itemsPerPage && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
            <span>
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} de{' '}
              {filteredData.length} registros
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded-lg text-slate-700 transition flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded-lg text-slate-700 transition flex items-center gap-1 shadow-sm cursor-pointer"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
