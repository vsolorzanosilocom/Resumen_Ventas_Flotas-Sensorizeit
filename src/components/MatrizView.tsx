/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Vista Principal - Matriz de Clientes, Activos y Análisis de Flotas
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Building2, 
  Radio, 
  CalendarPlus, 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  PieChart as PieIcon
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { MatrizRecord } from '../types';

interface MatrizViewProps {
  data: MatrizRecord[];
  onOpenDetail: (record: MatrizRecord) => void;
}

export const MatrizView: React.FC<MatrizViewProps> = ({ data, onOpenDetail }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedComercio, setSelectedComercio] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const donutChartRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartInstance = useRef<Chart | null>(null);
  const donutChartInstance = useRef<Chart | null>(null);

  // 1. Cálculos de KPIs
  const kpis = useMemo(() => {
    const dispTotales = data.filter((row) => {
      const val = row['SERIAL DISPOSITIVO'] || '';
      return String(val).trim() !== '';
    }).length;

    const clientesUnicos = new Set(
      data.map((row) => (row['EMPRESA'] || '').trim()).filter(Boolean)
    ).size;

    const serviciosActivos = new Set(
      data.map((row) => (row['COMERCIO'] || '').trim()).filter(Boolean)
    ).size;

    const comerciosRecientes = new Set<string>();
    data.forEach((row) => {
      const anio = parseInt(String(row['AñO DE INSTALACION'] || 0), 10);
      const mes = String(row['MES DE INSTALACION'] || '').toLowerCase().trim();
      const comercio = String(row['COMERCIO'] || '').trim();

      if (anio === 2026 && comercio !== '') {
        if (mes === 'junio' || mes === 'julio' || mes === '6' || mes === '7' || mes === 'agosto' || mes === 'septiembre') {
          comerciosRecientes.add(comercio);
        }
      }
    });

    return {
      dispTotales,
      clientesUnicos,
      serviciosActivos,
      instalacionesRecientes: comerciosRecientes.size,
    };
  }, [data]);

  // 2. Opciones Únicas para Filtros
  const { estadosList, comerciosList } = useMemo(() => {
    const estados = new Set<string>();
    const comercios = new Set<string>();
    data.forEach((row) => {
      if (row['ESTADO']) estados.add(String(row['ESTADO']).trim());
      if (row['COMERCIO']) comercios.add(String(row['COMERCIO']).trim());
    });
    return {
      estadosList: Array.from(estados).sort(),
      comerciosList: Array.from(comercios).sort(),
    };
  }, [data]);

  // 3. Filtrado de Datos
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return data.filter((row) => {
      let matchQuery = true;
      if (q !== '') {
        const com = String(row['COMERCIO'] || '').toLowerCase();
        const ser = String(row['SERIAL DISPOSITIVO'] || '').toLowerCase();
        const rif = String(row['RIF / IDEN'] || '').toLowerCase();
        const ciu = String(row['CIUDAD'] || '').toLowerCase();
        const est = String(row['ESTADO'] || '').toLowerCase();
        const emp = String(row['EMPRESA'] || '').toLowerCase();
        matchQuery = com.includes(q) || ser.includes(q) || rif.includes(q) || ciu.includes(q) || est.includes(q) || emp.includes(q);
      }

      const matchEstado = selectedEstado === '' || String(row['ESTADO'] || '').trim() === selectedEstado;
      const matchComercio = selectedComercio === '' || String(row['COMERCIO'] || '').trim() === selectedComercio;

      return matchQuery && matchEstado && matchComercio;
    });
  }, [data, searchQuery, selectedEstado, selectedComercio]);

  // 4. Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // 5. Configuración y renderizado de Gráficos (Chart.js)
  useEffect(() => {
    // Evolución de Instalaciones (Línea)
    if (lineChartRef.current) {
      if (lineChartInstance.current) lineChartInstance.current.destroy();

      const timeline: Record<string, number> = {};
      data.forEach((row) => {
        const yr = row['AñO DE INSTALACION'];
        const mo = row['MES DE INSTALACION'];
        if (yr && mo) {
          const label = `${String(mo).substring(0, 3)} ${yr}`;
          timeline[label] = (timeline[label] || 0) + 1;
        }
      });

      const labels = Object.keys(timeline);
      const values = Object.values(timeline);

      lineChartInstance.current = new Chart(lineChartRef.current, {
        type: 'line',
        data: {
          labels: labels.length ? labels : ['Sin datos'],
          datasets: [
            {
              label: 'Instalaciones',
              data: values.length ? values : [0],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2.5,
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#60a5fa',
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

    // Ventas por Tipo (Donut: Flotas vs Sensorizeit)
    if (donutChartRef.current) {
      if (donutChartInstance.current) donutChartInstance.current.destroy();

      const ventasPorTipo: Record<string, number> = { 'FLOTAS': 0, 'SENSORIZEIT': 0 };
      data.forEach((row) => {
        const codigo = String(row['CODIGO'] || '').toUpperCase().trim();
        const serial = String(row['SERIAL DISPOSITIVO'] || '').trim();
        if (serial !== '' && (codigo === 'FLOTAS' || codigo === 'SENSORIZEIT')) {
          ventasPorTipo[codigo] += 1;
        }
      });

      donutChartInstance.current = new Chart(donutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: Object.keys(ventasPorTipo),
          datasets: [
            {
              data: Object.values(ventasPorTipo),
              backgroundColor: ['#2563eb', '#10b981'],
              borderColor: '#ffffff',
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
              labels: { color: '#334155', font: { size: 11, weight: 'bold' } },
            },
          },
        },
      });
    }

    return () => {
      if (lineChartInstance.current) lineChartInstance.current.destroy();
      if (donutChartInstance.current) donutChartInstance.current.destroy();
    };
  }, [data]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Dispositivos Totales
            </p>
            <h3 id="kpi-dispositivos" className="text-3xl font-black text-slate-900 mt-1">
              {kpis.dispTotales}
            </h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl border border-blue-100">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Clientes Únicos
            </p>
            <h3 id="kpi-clientes-u" className="text-3xl font-black text-slate-900 mt-1">
              {kpis.clientesUnicos}
            </h3>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-xl border border-indigo-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Servicios Activos
            </p>
            <h3 id="kpi-servicios" className="text-3xl font-black text-slate-900 mt-1">
              {kpis.serviciosActivos}
            </h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl border border-emerald-100">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Instalaciones Recientes
            </p>
            <h3 id="kpi-instalaciones-r" className="text-3xl font-black text-slate-900 mt-1">
              {kpis.instalacionesRecientes}
            </h3>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3.5 rounded-xl border border-amber-100">
            <CalendarPlus className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Evolución Histórica de Instalaciones
            </h4>
          </div>
          <div className="h-64 relative">
            <canvas ref={lineChartRef}></canvas>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              Ventas por Categoría
            </h4>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            <canvas ref={donutChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* 3. Tabla Interactiva de Matriz con Filtros */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Barra de Filtros y Búsqueda */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="search-matriz"
              placeholder="Buscar por Comercio, Serial, RIF, Ciudad..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <select
              id="filter-estado"
              value={selectedEstado}
              onChange={(e) => {
                setSelectedEstado(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="">Todos los Estados ({estadosList.length})</option>
              {estadosList.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>

            <select
              id="filter-comercio"
              value={selectedComercio}
              onChange={(e) => {
                setSelectedComercio(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px] shadow-sm"
            >
              <option value="">Todos los Comercios ({comerciosList.length})</option>
              {comerciosList.map((com) => (
                <option key={com} value={com}>{com}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Serial Dispositivo</th>
                <th className="p-4">RIF / IDEN</th>
                <th className="p-4">Comercio</th>
                <th className="p-4">Ciudad / Estado</th>
                <th className="p-4">Fecha Instalación</th>
                <th className="p-4 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody id="tbody-matriz" className="divide-y divide-slate-100 bg-white">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    No se encontraron registros que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-blue-600">
                      {row['SERIAL DISPOSITIVO'] || 'N/A'}
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {row['RIF / IDEN'] || 'N/A'}
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      {row['COMERCIO'] || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-600">
                      {row['CIUDAD'] || 'N/A'}, {row['ESTADO'] || ''}
                    </td>
                    <td className="p-4 text-slate-500">
                      {row['FECHA DE INSTALACIÓN'] || 'N/A'}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onOpenDetail(row)}
                        title="Ver ficha completa del dispositivo"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg border border-blue-200/80 transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
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
