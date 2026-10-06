/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Datos Base Iniciales y Caché Estructural
 */

import { MatrizRecord, RenovacionRecord } from '../types';

export const INITIAL_MATRIZ: MatrizRecord[] = [
  {
    "EMPRESA": "DISTRIBUIDORA POLAR C.A.",
    "SERIAL DISPOSITIVO": "FLT-88201",
    "RIF / IDEN": "J-00041372-9",
    "COMERCIO": "Polar Centro Logístico",
    "CIUDAD": "Valencia",
    "ESTADO": "Carabobo",
    "FECHA DE INSTALACIÓN": "15/01/2026",
    "MARCA DISPOSITIVO": "Teltonika",
    "MODELO DISPOSITIVO": "FMB920",
    "NOMBRE PRODUCTO": "GPS Flotas Premium",
    "CODIGO": "FLOTAS",
    "AñO DE INSTALACION": 2026,
    "MES DE INSTALACION": "junio"
  },
  {
    "EMPRESA": "AGROPECUARIA EL PINAL",
    "SERIAL DISPOSITIVO": "SNZ-44102",
    "RIF / IDEN": "J-31089201-4",
    "COMERCIO": "Silo Granos Calabozo",
    "CIUDAD": "Calabozo",
    "ESTADO": "Guárico",
    "FECHA DE INSTALACIÓN": "20/02/2026",
    "MARCA DISPOSITIVO": "Sensorizeit Tech",
    "MODELO DISPOSITIVO": "SNZ-TEMP-PRO",
    "NOMBRE PRODUCTO": "Telemetría Temperatura Silos",
    "CODIGO": "SENSORIZEIT",
    "AñO DE INSTALACION": 2026,
    "MES DE INSTALACION": "julio"
  },
  {
    "EMPRESA": "LOGISTICA CARACAS EXPRESS",
    "SERIAL DISPOSITIVO": "FLT-99312",
    "RIF / IDEN": "J-29837411-2",
    "COMERCIO": "Sede Guatire",
    "CIUDAD": "Guatire",
    "ESTADO": "Miranda",
    "FECHA DE INSTALACIÓN": "05/03/2026",
    "MARCA DISPOSITIVO": "Queclink",
    "MODELO DISPOSITIVO": "GV300",
    "NOMBRE PRODUCTO": "GPS Flotas Estándar",
    "CODIGO": "FLOTAS",
    "AñO DE INSTALACION": 2026,
    "MES DE INSTALACION": "junio"
  },
  {
    "EMPRESA": "MOLINOS NACIONALES MONACA",
    "SERIAL DISPOSITIVO": "SNZ-55091",
    "RIF / IDEN": "J-00129845-0",
    "COMERCIO": "Planta Puerto Cabello",
    "CIUDAD": "Puerto Cabello",
    "ESTADO": "Carabobo",
    "FECHA DE INSTALACIÓN": "12/04/2026",
    "MARCA DISPOSITIVO": "Sensorizeit Tech",
    "MODELO DISPOSITIVO": "SNZ-HUMID-V2",
    "NOMBRE PRODUCTO": "Monitoreo Humedad y Gases",
    "CODIGO": "SENSORIZEIT",
    "AñO DE INSTALACION": 2026,
    "MES DE INSTALACION": "julio"
  },
  {
    "EMPRESA": "TRANSPORTE Y CARGA OCCIDENTE",
    "SERIAL DISPOSITIVO": "FLT-77145",
    "RIF / IDEN": "J-40192837-5",
    "COMERCIO": "Base Maracaibo Sur",
    "CIUDAD": "Maracaibo",
    "ESTADO": "Zulia",
    "FECHA DE INSTALACIÓN": "18/05/2026",
    "MARCA DISPOSITIVO": "Teltonika",
    "MODELO DISPOSITIVO": "FMB120",
    "NOMBRE PRODUCTO": "GPS Flotas Premium",
    "CODIGO": "FLOTAS",
    "AñO DE INSTALACION": 2026,
    "MES DE INSTALACION": "julio"
  },
  {
    "EMPRESA": "SILOS Y ALMACENES DE VENEZUELA",
    "SERIAL DISPOSITIVO": "SNZ-88910",
    "RIF / IDEN": "J-30491823-7",
    "COMERCIO": "Planta Acarigua Centro",
    "CIUDAD": "Acarigua",
    "ESTADO": "Portuguesa",
    "FECHA DE INSTALACIÓN": "22/06/2026",
    "MARCA DISPOSITIVO": "Sensorizeit Tech",
    "MODELO DISPOSITIVO": "SNZ-LEVEL-OPT",
    "NOMBRE PRODUCTO": "Nivel Ultrasonido Silos",
    "CODIGO": "SENSORIZEIT",
    "AñO DE INSTALACION": 2026,
    "MES DE INSTALACION": "junio"
  }
];

export const INITIAL_RENOVACIONES: RenovacionRecord[] = [
  {
    "Clientes": "DISTRIBUIDORA POLAR C.A.",
    "Localidad": "Carabobo / Valencia",
    "Condiciones": "Contrato Anual Corporativo",
    "Fecha de próxima renovación (vencimiento servicio)": "15/11/2026",
    "Acción": "OK",
    "Tárifa Mensual $$": "350.00",
    "Tárifa de renovacion $$": "350.00",
    "Servicio": "Monitoreo Flotas GPS"
  },
  {
    "Clientes": "AGROPECUARIA EL PINAL",
    "Localidad": "Guárico / Calabozo",
    "Condiciones": "Facturación Mensual Vencida",
    "Fecha de próxima renovación (vencimiento servicio)": "01/10/2026",
    "Acción": "COBRAR",
    "Tárifa Mensual $$": "180.00",
    "Tárifa de renovacion $$": "180.00",
    "Servicio": "Sensorizeit Telemetría"
  },
  {
    "Clientes": "MOLINOS NACIONALES MONACA",
    "Localidad": "Carabobo / Pto Cabello",
    "Condiciones": "Suscripción Trimestral",
    "Fecha de próxima renovación (vencimiento servicio)": "30/10/2026",
    "Acción": "COBRAR",
    "Tárifa Mensual $$": "520.00",
    "Tárifa de renovacion $$": "520.00",
    "Servicio": "Sensorizeit Silos Full"
  },
  {
    "Clientes": "LOGISTICA CARACAS EXPRESS",
    "Localidad": "Miranda / Guatire",
    "Condiciones": "Plan Prepago Semestral",
    "Fecha de próxima renovación (vencimiento servicio)": "20/12/2026",
    "Acción": "OK",
    "Tárifa Mensual $$": "240.00",
    "Tárifa de renovacion $$": "240.00",
    "Servicio": "Monitoreo Flotas GPS"
  },
  {
    "Clientes": "TRANSPORTE Y CARGA OCCIDENTE",
    "Localidad": "Zulia / Maracaibo",
    "Condiciones": "Pago Contra Factura",
    "Fecha de próxima renovación (vencimiento servicio)": "15/10/2026",
    "Acción": "COBRAR",
    "Tárifa Mensual $$": "310.00",
    "Tárifa de renovacion $$": "310.00",
    "Servicio": "Monitoreo Flotas GPS"
  }
];
