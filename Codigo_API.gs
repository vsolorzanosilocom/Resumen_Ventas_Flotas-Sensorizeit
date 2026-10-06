/**
 * PROYECTO: Control y Gestión de Flotas - Sensorizeit Ventas
 * DESARROLLO & ARQUITECTURA: Victor Solorzano
 * ASISTENCIA TÉCNICA: Antigravity IDE
 * ROL: Backend API REST para Google Apps Script & Google Sheets
 */

// ID OFICIAL DE LA HOJA DE CÁLCULO EN GOOGLE DRIVE
const SPREADSHEET_ID = "1q7PHdhNAUTMBApw3Zd0dXrFCf3jbyODO65L1gCAa7Xo";
const FALLBACK_FILE_NAME = "GESTION FLOTAS - SENSORIZEIT VENTAS";

/**
 * Manejador principal HTTP GET para consumir desde la Web App de Vercel.
 * Retorna respuestas formateadas en JSON con soporte nativo de CORS.
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'loadAll';
  var response;

  try {
    if (action === 'matriz') {
      response = getSheetData("MATRIZ");
    } else if (action === 'renovaciones') {
      response = getSheetData("RENOVACIONES");
    } else if (action === 'ping') {
      response = { 
        success: true, 
        message: "Conexión exitosa con Google Apps Script", 
        spreadsheetId: SPREADSHEET_ID,
        timestamp: new Date().toISOString() 
      };
    } else {
      // Carga unificada de ambas hojas
      response = loadAllDatabase();
    }
  } catch (err) {
    response = { success: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Obtiene la referencia al documento de Google Sheets (por ID directo o por nombre).
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (e) {
      Logger.log("No se pudo abrir por ID, intentando por nombre: " + e.message);
    }
  }

  var files = DriveApp.getFilesByName(FALLBACK_FILE_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }

  throw new Error("No se encontró el archivo de Google Sheets. Verifica el ID: " + SPREADSHEET_ID);
}

/**
 * Obtiene los datos de una hoja específica del archivo de flotas con control de errores.
 * Cumple estrictamente la regla de protección de fórmulas: solo lectura calculada con getValues().
 * @param {string} sheetName Nombre de la hoja ("MATRIZ" o "RENOVACIONES").
 */
function getSheetData(sheetName) {
  try {
    var spreadsheet = getSpreadsheet();
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error("La pestaña '" + sheetName + "' no existe en el archivo. Verifica el nombre exacto de la hoja.");
    }
    
    var values = sheet.getDataRange().getValues();
    if (values.length < 2) {
      return { success: true, data: [], headers: [], message: "La hoja no contiene filas suficientes de datos." };
    }
    
    // Identificar fila de cabecera dinámicamente para evitar filas de títulos o cortesía
    var headerRowIndex = 0;
    if (sheetName === "RENOVACIONES") {
      for (var i = 0; i < values.length; i++) {
        if (values[i].indexOf("Clientes") > -1 || values[i].indexOf("RIF / IDEN") > -1) {
          headerRowIndex = i;
          break;
        }
      }
    } else {
      for (var i = 0; i < values.length; i++) {
        if (values[i].indexOf("EMPRESA") > -1 || values[i].indexOf("SERIAL DISPOSITIVO") > -1) {
          headerRowIndex = i;
          break;
        }
      }
    }
    
    // Sanitizar cabeceras de columnas y resolver duplicados
    var rawHeaders = values[headerRowIndex];
    var headers = [];
    var seen = {};
    for (var k = 0; k < rawHeaders.length; k++) {
      var h = rawHeaders[k].toString().trim() || "Columna_" + k;
      if (seen[h]) {
        seen[h]++;
        headers.push(h + " (" + seen[h] + ")");
      } else {
        seen[h] = 1;
        headers.push(h);
      }
    }
    
    var dataRows = [];
    for (var j = headerRowIndex + 1; j < values.length; j++) {
      var row = values[j];
      
      // Validar si la fila contiene datos reales
      var hasValue = false;
      for (var c = 0; c < row.length; c++) {
        if (row[c] !== "" && row[c] !== null) {
          hasValue = true;
          break;
        }
      }
      if (!hasValue) continue;
      
      var record = {};
      for (var k = 0; k < headers.length; k++) {
        var key = headers[k];
        var val = row[k];
        
        if (val instanceof Date) {
          record[key] = Utilities.formatDate(val, Session.getScriptTimeZone(), "dd/MM/yyyy");
        } else {
          record[key] = val;
        }
      }
      dataRows.push(record);
    }
    
    return { success: true, data: dataRows, headers: headers };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Carga concurrente y unificada de ambas tablas para optimizar los tiempos de respuesta.
 */
function loadAllDatabase() {
  return {
    success: true,
    matriz: getSheetData("MATRIZ"),
    renovaciones: getSheetData("RENOVACIONES"),
    timestamp: new Date().toISOString()
  };
}
