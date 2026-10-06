/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Definición de Modelos y Tipos de Datos TypeScript
 */

export interface MatrizRecord {
  [key: string]: any;
  EMPRESA?: string;
  'SERIAL DISPOSITIVO'?: string;
  'RIF / IDEN'?: string;
  COMERCIO?: string;
  CIUDAD?: string;
  ESTADO?: string;
  'FECHA DE INSTALACIÓN'?: string;
  'MARCA DISPOSITIVO'?: string;
  'MODELO DISPOSITIVO'?: string;
  'NOMBRE PRODUCTO'?: string;
  CODIGO?: string;
  'AñO DE INSTALACION'?: string | number;
  'MES DE INSTALACION'?: string | number;
}

export interface RenovacionRecord {
  [key: string]: any;
  Clientes?: string;
  Localidad?: string;
  Condiciones?: string;
  'Fecha de próxima renovación (vencimiento servicio)'?: string;
  Acción?: 'OK' | 'COBRAR' | string;
  'Tárifa Mensual $$'?: string | number;
  'Tárifa de renovacion $$'?: string | number;
  Servicio?: string;
  'RIF / IDEN'?: string;
}

export interface DatabaseState {
  matriz: MatrizRecord[];
  renovaciones: RenovacionRecord[];
  lastSyncTime?: string;
  headersMatriz?: string[];
  headersRenovaciones?: string[];
}

export interface AppConfig {
  scriptUrl: string;
  spreadsheetId: string;
  autoSync: boolean;
}

export type SyncStatus = 'idle' | 'syncing' | 'connected' | 'error';
