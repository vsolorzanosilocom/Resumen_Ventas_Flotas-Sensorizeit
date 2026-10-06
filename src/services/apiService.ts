/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Servicio de Comunicación y Sincronización en Tiempo Real con Google Sheets
 */

import { AppConfig, DatabaseState } from '../types';
import { INITIAL_MATRIZ, INITIAL_RENOVACIONES } from '../data/seedData';

const CONFIG_STORAGE_KEY = 'silocom_flotas_config_v1';
const CACHE_STORAGE_KEY = 'silocom_flotas_cache_v1';

export const DEFAULT_CONFIG: AppConfig = {
  // URL oficial permanente de Google Apps Script vinculada a Google Sheets
  scriptUrl: (
    import.meta.env.VITE_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbx8BEU3_ZoPe0Ruh1677lPfw5r7veNc0HgQAkz165lU9GW_FkODl4kQ7ihFLpLaOF5P/exec'
  ).trim(),
  spreadsheetId: '1q7PHdhNAUTMBApw3Zd0dXrFCf3jbyODO65L1gCAa7Xo',
  autoSync: true,
};

export function getAppConfig(): AppConfig {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Auto-migración: si el usuario tenía la URL vacía en su navegador, usar la predeterminada fija
      if ((!parsed.scriptUrl || parsed.scriptUrl.trim() === '') && DEFAULT_CONFIG.scriptUrl) {
        parsed.scriptUrl = DEFAULT_CONFIG.scriptUrl;
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ ...DEFAULT_CONFIG, ...parsed }));
      }
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('Error al leer configuración de localStorage:', e);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveAppConfig(config: AppConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Error al guardar configuración en localStorage:', e);
  }
}

export function getCachedDatabase(): DatabaseState {
  try {
    const saved = localStorage.getItem(CACHE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.matriz && parsed.matriz.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error al leer caché local:', e);
  }
  return {
    matriz: INITIAL_MATRIZ,
    renovaciones: INITIAL_RENOVACIONES,
    lastSyncTime: 'Datos de inicio',
  };
}

export function saveCachedDatabase(state: DatabaseState): void {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Error al guardar caché local:', e);
  }
}

/**
 * Consulta en tiempo real a Google Apps Script para sincronizar las hojas de Google Sheets.
 */
export async function syncDatabaseFromSheets(scriptUrl?: string): Promise<DatabaseState> {
  const targetUrl = (scriptUrl || getAppConfig().scriptUrl || '').trim();

  if (!targetUrl) {
    throw new Error('No se ha configurado la URL del Web App de Google Apps Script.');
  }

  const endpoint = `${targetUrl}?action=loadAll&t=${Date.now()}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    if (!json.success && json.error) {
      throw new Error(json.error);
    }

    const matrizData = json.matriz && json.matriz.data ? json.matriz.data : [];
    const renovacionesData = json.renovaciones && json.renovaciones.data ? json.renovaciones.data : [];

    const newState: DatabaseState = {
      matriz: matrizData.length > 0 ? matrizData : INITIAL_MATRIZ,
      renovaciones: renovacionesData.length > 0 ? renovacionesData : INITIAL_RENOVACIONES,
      lastSyncTime: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      headersMatriz: json.matriz?.headers || [],
      headersRenovaciones: json.renovaciones?.headers || [],
    };

    saveCachedDatabase(newState);
    return newState;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado al conectar con Google Sheets (25s).');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Prueba la conectividad de la URL de Google Apps Script.
 */
export async function testConnection(scriptUrl: string): Promise<{ success: boolean; message: string }> {
  if (!scriptUrl || !scriptUrl.trim()) {
    return { success: false, message: 'La URL está vacía.' };
  }

  try {
    const endpoint = `${scriptUrl.trim()}?action=ping&t=${Date.now()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(endpoint, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { success: true, message: '¡Conexión establecida con Google Sheets!' };
      }
    }
    return { success: false, message: `Respuesta no válida del servidor (HTTP ${res.status}).` };
  } catch (e: any) {
    return { success: false, message: e.message || 'Fallo de conexión CORS o tiempo agotado.' };
  }
}
