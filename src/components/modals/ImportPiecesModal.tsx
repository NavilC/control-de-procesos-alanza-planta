import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Building2, 
  ArrowRight,
  FileCheck,
  Search,
  Code2, 
  FileCode2, 
  Sparkles, 
  Split, 
  Boxes,
  Layers,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Tag
} from 'lucide-react';
import { ElementType, Piece } from '../../types';
import { playFeedbackSound } from '../../utils/audioFeedback';

export interface ColumnMapping {
  mark: string;
  profile: string;
  category: string;
  type: string;
  length: string;
  quantity: string;
  saldo: string;
  totalWeight: string;
  unitWeight: string;
  paintArea: string;
  project: string;
  steelGrade: string;
  workOrder: string;
  notes: string;
}

export interface ParsedRow {
  id: string;
  selected: boolean;
  isValid: boolean;
  issues: string[];
  mark: string;
  type: ElementType | string;
  category?: string;
  profile: string;
  description?: string;
  lengthMeters: number;
  weightKg: number; // Unit weight per piece
  unitWeightKgPerMeter?: number; // kg/m (e.g. 49.21)
  totalWeightKg: number; // Total weight for the batch (e.g. 5303.46)
  paintAreaM2?: number; // m2_pintura_por_unidad (e.g. 11.7)
  paintAreaTotalM2?: number;
  quantity: number; // e.g. 12
  balance?: number; // saldo, e.g. 12
  unit?: string; // 'unid'
  excelRow?: number; // fila_excel, e.g. 20
  project: string;
  steelGrade: string;
  workOrder?: string;
  notes?: string;
  // Extras
  camberMm?: number;
  plateWidthMm?: number;
  plateHeightMm?: number;
  holeDiameterMm?: number;
  rodLengthMm?: number;
  threadLengthMm?: number;
  raw: any;
}

const SAMPLE_JSON_SNIPPET = `[
  {
    "marca": "1VP-1",
    "categoria": "VIGAS PRINCIPALES",
    "descripcion": "W 10 X 33",
    "longitud_m": 8.981,
    "unidad": "unid",
    "cantidad": 12,
    "m2_pintura_por_unidad": 11.7,
    "peso_unitario_kg": 49.21,
    "peso_total_kg": 5303.46012,
    "despachos": [],
    "saldo": 12,
    "fila_excel": 20,
    "formulas_excel": {
      "peso_total_kg": "=C20*E20*G20"
    }
  },
  {
    "marca": "1CP-4",
    "categoria": "COLUMNAS PRINCIPALES",
    "descripcion": "W 12 X 65",
    "longitud_m": 6.450,
    "unidad": "unid",
    "cantidad": 8,
    "m2_pintura_por_unidad": 9.2,
    "peso_unitario_kg": 96.73,
    "peso_total_kg": 4991.268,
    "despachos": [],
    "saldo": 8,
    "fila_excel": 21,
    "formulas_excel": {
      "peso_total_kg": "=C21*E21*G21"
    }
  }
]`;

// Normalization helper
const normalizeKey = (key: string): string => {
  return String(key || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

// Auto-detect the best matching column key from available headers
const findBestColumn = (headers: string[], candidates: string[], sampleRows?: Record<string, any>[]): string => {
  if (!headers || headers.length === 0) return '';

  // 1. Exact normalized match
  for (const cand of candidates) {
    const found = headers.find(h => normalizeKey(h) === cand);
    if (found) return found;
  }

  // 2. Starts with / ends with / contains match
  for (const cand of candidates) {
    const found = headers.find(h => {
      const norm = normalizeKey(h);
      return norm === cand || norm.startsWith(`${cand}_`) || norm.endsWith(`_${cand}`) || norm.includes(cand);
    });
    if (found) return found;
  }

  // 3. Optional sample row inspection
  if (sampleRows && sampleRows.length > 0) {
    for (const h of headers) {
      const val = String(sampleRows[0][h] || '').trim();
      if (!val) continue;
      // If looking for profile and looks like steel profile
      if (candidates.includes('perfil') || candidates.includes('descripcion')) {
        if (/^(W|IPR|IR|IS|HSS|UPN|IPN|IPE|HEB|HEA|HEM|C|CF|L|LI|LD|WT|24K|18K|PL|PTR)\s*\d+/i.test(val) || /\d+\s*[xX]\s*\d+/.test(val)) {
          return h;
        }
      }
    }
  }

  return '';
};

export const ImportPiecesModal: React.FC = () => {
  const { 
    isImportPiecesModalOpen, 
    setIsImportPiecesModalOpen, 
    addPiecesBatch, 
    projects 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [jsonText, setJsonText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Data State
  const [rawDataset, setRawDataset] = useState<Record<string, any>[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    mark: '',
    profile: '',
    category: '',
    type: '',
    length: '',
    quantity: '',
    saldo: '',
    totalWeight: '',
    unitWeight: '',
    paintArea: '',
    project: '',
    steelGrade: '',
    workOrder: '',
    notes: ''
  });
  const [isMappingExpanded, setIsMappingExpanded] = useState<boolean>(true);

  // Settings
  const [defaultProject, setDefaultProject] = useState<string>(projects[0]?.name || 'Torre Mítica');
  const [overrideAllProject, setOverrideAllProject] = useState(false);
  const [multiQuantityMode, setMultiQuantityMode] = useState<'consolidated' | 'split'>('consolidated');
  const [keepSameMarkInSplit, setKeepSameMarkInSplit] = useState<boolean>(true);
  const [preserveExactMarks, setPreserveExactMarks] = useState<boolean>(true);
  const [preserveExactProfiles, setPreserveExactProfiles] = useState<boolean>(true);

  // Display State
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'issues'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setIsImportPiecesModalOpen(false);
    setTimeout(() => {
      setFileName(null);
      setRawDataset([]);
      setDetectedHeaders([]);
      setParsedRows([]);
      setImportSuccessCount(null);
      setSearchTerm('');
      setJsonText('');
    }, 200);
  };

  const inferElementType = (rawType: string, mark: string, profile: string, category: string): ElementType | string => {
    const t = (rawType || '').toLowerCase().trim();
    const c = (category || '').toLowerCase().trim();
    const p = (profile || '').toUpperCase().trim();
    const m = (mark || '').toUpperCase().trim();

    if (t.includes('joist') || c.includes('joist') || p.includes('24K') || p.includes('18K') || m.startsWith('J-') || m.startsWith('JOIST')) {
      return 'Joist';
    }
    if (t.includes('placa') || c.includes('placa') || p.startsWith('PL ') || p.startsWith('PL-') || m.startsWith('PL-') || m.startsWith('BP-')) {
      return 'Placa';
    }
    if (t.includes('varilla') || t.includes('punta') || c.includes('anclaje') || c.includes('varilla') || p.startsWith('VR ') || m.startsWith('AN-')) {
      return 'Punta roscada';
    }
    if (t.includes('perno') || t.includes('tornillo') || c.includes('perno') || c.includes('tornillo') || p.startsWith('A325') || p.startsWith('A490') || m.startsWith('P-')) {
      return 'Pernos';
    }
    if (t.includes('columna') || c.includes('columna') || m.startsWith('C-') || m.startsWith('COL-') || m.includes('CP-')) {
      return 'Columna';
    }
    if (t.includes('riostra') || t.includes('arriostramiento') || c.includes('riostra') || m.startsWith('R-') || m.startsWith('BR-')) {
      return 'Riostra';
    }
    if (t.includes('viga') || c.includes('viga') || m.startsWith('V-') || m.includes('VP-') || m.includes('VS-') || p.startsWith('W') || p.startsWith('IPR')) {
      return 'Viga';
    }
    return 'Viga';
  };

  // Parses raw row objects into ParsedRow[] using active column mapping
  const buildParsedRowsFromRaw = (
    rawData: Record<string, any>[], 
    mapping: ColumnMapping, 
    sourceName: string
  ): ParsedRow[] => {
    if (!rawData || rawData.length === 0) return [];

    return rawData.map((row, index) => {
      // Helper to get raw value by mapping key or fallback aliases
      const getVal = (fieldKey: keyof ColumnMapping, fallbackCandidates: string[] = []): any => {
        const primaryCol = mapping[fieldKey];
        if (primaryCol && row[primaryCol] !== undefined && row[primaryCol] !== '') {
          return row[primaryCol];
        }
        // Fallback to searching object keys directly
        for (const cand of fallbackCandidates) {
          for (const key of Object.keys(row)) {
            if (normalizeKey(key) === cand) {
              const val = row[key];
              if (val !== undefined && val !== '') return val;
            }
          }
        }
        return undefined;
      };

      // 1. Marca: Preserve EXACT value from Excel
      let rawMark = getVal('mark', [
        'marca', 'mark', 'tag', 'codigo', 'cod', 'codigo_pieza', 'pieza', 'elemento',
        'pos', 'posicion', 'pos_no', 'item', 'cve', 'clave', 'ensamble', 'assembly', 'id'
      ]);
      
      let markValue = '';
      if (rawMark !== undefined && rawMark !== null && String(rawMark).trim() !== '') {
        markValue = preserveExactMarks ? String(rawMark).trim() : String(rawMark).trim().toUpperCase();
      } else {
        markValue = `P-IMP-${index + 1}`;
      }

      // 2. Category: e.g. "VIGAS PRINCIPALES"
      const rawCategory = getVal('category', ['categoria', 'category', 'grupo', 'clasificacion']);
      const categoryValue = rawCategory !== undefined ? String(rawCategory).trim() : '';

      // 3. Perfil: Preserve EXACT value from Excel (e.g. "W 10 X 33")
      // Check mapped column first, then candidates: descripcion, perfil, seccion, etc.
      let rawProfile = getVal('profile', [
        'perfil', 'descripcion', 'profile', 'seccion', 'seccion_perfil', 'dimension',
        'dimensiones', 'material', 'tipo_perfil', 'especificacion', 'medida', 'size'
      ]);

      let profileValue = '';
      if (rawProfile !== undefined && rawProfile !== null && String(rawProfile).trim() !== '') {
        profileValue = preserveExactProfiles ? String(rawProfile).trim() : String(rawProfile).trim().toUpperCase();
      } else {
        // Look for any string in this row that looks like a steel section (e.g. W 10 X 33)
        for (const k of Object.keys(row)) {
          const v = String(row[k] || '').trim();
          if (/^(W|IPR|IR|IS|HSS|UPN|IPN|IPE|HEB|HEA|HEM|C|CF|L|LI|LD|WT|24K|18K|PL|PTR)\s*\d+/i.test(v) || /\d+\s*[xX]\s*\d+/.test(v)) {
            profileValue = v;
            break;
          }
        }
        // If still not found, do not force W18x50! Keep category or placeholder
        if (!profileValue) {
          profileValue = categoryValue || '-';
        }
      }

      // 4. Type
      const rawType = getVal('type', ['tipo', 'type']);
      const typeValue = inferElementType(String(rawType || ''), markValue, profileValue, categoryValue);

      // 5. Length (longitud_m)
      const rawLength = getVal('length', ['longitud_m', 'longitud', 'longitud_metros', 'length', 'largo']);
      let lengthNum = typeof rawLength === 'number' ? rawLength : parseFloat(String(rawLength || '').replace(',', '.'));
      if (isNaN(lengthNum) || lengthNum <= 0) lengthNum = 6.0;

      // 6. Quantity (cantidad) & Saldo
      const rawQty = getVal('quantity', ['cantidad', 'qty', 'cant', 'piezas', 'unidades']);
      const qtyNum = parseInt(String(rawQty || 1), 10) || 1;

      const rawSaldo = getVal('saldo', ['saldo', 'balance', 'pendiente']);
      const saldoNum = rawSaldo !== undefined && rawSaldo !== '' ? parseInt(String(rawSaldo), 10) : qtyNum;

      // 7. Paint Area (m2_pintura_por_unidad)
      const rawPaint = getVal('paintArea', ['m2_pintura_por_unidad', 'm2_pintura', 'pintura_m2', 'area_pintura', 'pintura']);
      const paintAreaNum = rawPaint !== undefined && rawPaint !== '' ? parseFloat(String(rawPaint).replace(',', '.')) : undefined;

      // 8. Weights (peso_total_kg, peso_unitario_kg)
      const rawTotalWeight = getVal('totalWeight', ['peso_total_kg', 'peso_total', 'total_kg', 'kilos_totales', 'peso_tot']);
      const rawUnitWeight = getVal('unitWeight', ['peso_unitario_kg', 'peso_unitario', 'peso_kg', 'peso', 'kilos']);

      let parsedTotalWeight = rawTotalWeight !== undefined && rawTotalWeight !== '' ? parseFloat(String(rawTotalWeight).replace(',', '.')) : 0;
      let parsedUnitWeight = rawUnitWeight !== undefined && rawUnitWeight !== '' ? parseFloat(String(rawUnitWeight).replace(',', '.')) : 0;

      let pieceUnitWeight = 0;
      let linearWeightKgM: number | undefined = undefined;

      if (parsedTotalWeight > 0) {
        pieceUnitWeight = parsedTotalWeight / Math.max(1, qtyNum);
        if (parsedUnitWeight > 0) {
          linearWeightKgM = parsedUnitWeight;
        }
      } else if (parsedUnitWeight > 0) {
        if (lengthNum > 0 && parsedUnitWeight < 250 && !row['peso_pieza']) {
          linearWeightKgM = parsedUnitWeight;
          pieceUnitWeight = lengthNum * parsedUnitWeight;
          parsedTotalWeight = pieceUnitWeight * qtyNum;
        } else {
          pieceUnitWeight = parsedUnitWeight;
          parsedTotalWeight = pieceUnitWeight * qtyNum;
        }
      } else {
        pieceUnitWeight = 350;
        parsedTotalWeight = 350 * qtyNum;
      }

      // 9. Project
      const rawProj = getVal('project', ['proyecto', 'project', 'obra']);
      const projectValue = rawProj !== undefined && String(rawProj).trim() !== '' ? String(rawProj).trim() : defaultProject;

      // 10. Steel Grade
      const rawGrade = getVal('steelGrade', ['acero', 'grado', 'grado_acero', 'steel_grade', 'calidad']);
      const steelGradeValue = rawGrade !== undefined && String(rawGrade).trim() !== '' ? String(rawGrade).trim() : 'ASTM A992 Grado 50';

      // 11. Work Order
      const rawWO = getVal('workOrder', ['ot', 'orden', 'orden_de_trabajo', 'orden_trabajo', 'op']);
      const workOrderValue = rawWO !== undefined && String(rawWO).trim() !== '' ? String(rawWO).trim() : 'OT-2026-IMP';

      // 12. Notes & Extras
      const rawNotes = getVal('notes', ['observaciones', 'notas', 'notes', 'comentarios']);
      const notesValue = rawNotes !== undefined ? String(rawNotes).trim() : '';

      const unitValue = String(row['unidad'] || row['unit'] || 'unid').trim();
      const excelRowValue = row['__excel_row_num'] ? Number(row['__excel_row_num']) : (row['fila_excel'] ? parseInt(String(row['fila_excel']), 10) : (index + 1));

      // Extras
      const camberNum = parseFloat(String(row['camber'] || row['contraflecha'] || ''));
      const plateWidth = parseFloat(String(row['ancho_placa'] || row['ancho'] || ''));
      const plateHeight = parseFloat(String(row['alto_placa'] || row['alto'] || ''));
      const holeDiam = parseFloat(String(row['diametro_perforacion'] || row['diametro_agujero'] || row['agujero'] || ''));
      const rodLen = parseFloat(String(row['longitud_varilla'] || row['longitud_roscada'] || ''));
      const threadLen = parseFloat(String(row['longitud_rosca'] || row['rosca'] || ''));

      // Issues check
      const issues: string[] = [];
      if (!markValue || markValue === `P-IMP-${index + 1}`) {
        issues.push('Marca no identificada en columna');
      }
      if (profileValue === '-' || !profileValue) {
        issues.push('Perfil no identificado');
      }
      if (pieceUnitWeight <= 0) issues.push('Peso no detectado');
      if (lengthNum <= 0) issues.push('Longitud 0m');

      return {
        id: `ROW-${index + 1}`,
        selected: true,
        isValid: issues.length === 0,
        issues,
        mark: markValue,
        type: typeValue,
        category: categoryValue || undefined,
        profile: profileValue,
        description: categoryValue ? `${categoryValue} - ${profileValue}` : profileValue,
        lengthMeters: Number(lengthNum.toFixed(3)),
        weightKg: Number(pieceUnitWeight.toFixed(2)),
        unitWeightKgPerMeter: linearWeightKgM !== undefined ? Number(linearWeightKgM.toFixed(2)) : undefined,
        totalWeightKg: Number(parsedTotalWeight.toFixed(2)),
        paintAreaM2: paintAreaNum !== undefined && !isNaN(paintAreaNum) ? Number(paintAreaNum.toFixed(2)) : undefined,
        paintAreaTotalM2: paintAreaNum !== undefined && !isNaN(paintAreaNum) ? Number((paintAreaNum * qtyNum).toFixed(2)) : undefined,
        quantity: qtyNum,
        balance: !isNaN(saldoNum) ? saldoNum : qtyNum,
        unit: unitValue,
        excelRow: excelRowValue,
        project: projectValue || defaultProject,
        steelGrade: steelGradeValue,
        workOrder: workOrderValue,
        notes: notesValue,
        camberMm: !isNaN(camberNum) ? camberNum : undefined,
        plateWidthMm: !isNaN(plateWidth) ? plateWidth : undefined,
        plateHeightMm: !isNaN(plateHeight) ? plateHeight : undefined,
        holeDiameterMm: !isNaN(holeDiam) ? holeDiam : undefined,
        rodLengthMm: !isNaN(rodLen) ? rodLen : undefined,
        threadLengthMm: !isNaN(threadLen) ? threadLen : undefined,
        raw: row
      };
    });
  };

  // Initialize data with automatic column mapping detection
  const initializeDataset = (rawRows: Record<string, any>[], sourceName: string) => {
    if (!rawRows || rawRows.length === 0) {
      alert('El archivo no contiene filas con datos legibles.');
      return;
    }

    // Extract all unique headers across rows
    const headersSet = new Set<string>();
    rawRows.forEach(r => {
      Object.keys(r).forEach(k => {
        if (!k.startsWith('__')) headersSet.add(k);
      });
    });
    const headers = Array.from(headersSet);

    // Auto-detect best columns
    const detectedMapping: ColumnMapping = {
      mark: findBestColumn(headers, [
        'marca', 'mark', 'tag', 'codigo', 'cod', 'codigo_pieza', 'pieza', 'elemento',
        'pos', 'posicion', 'pos_no', 'item', 'cve', 'clave', 'ensamble', 'assembly', 'id'
      ]),
      profile: findBestColumn(headers, [
        'perfil', 'descripcion', 'profile', 'seccion', 'seccion_perfil', 'dimension',
        'dimensiones', 'material', 'tipo_perfil', 'especificacion', 'medida', 'size'
      ], rawRows),
      category: findBestColumn(headers, ['categoria', 'category', 'grupo', 'clasificacion']),
      type: findBestColumn(headers, ['tipo', 'type', 'elemento_tipo']),
      length: findBestColumn(headers, ['longitud_m', 'longitud', 'longitud_metros', 'length', 'largo']),
      quantity: findBestColumn(headers, ['cantidad', 'qty', 'cant', 'piezas', 'unidades']),
      saldo: findBestColumn(headers, ['saldo', 'balance', 'pendiente']),
      totalWeight: findBestColumn(headers, ['peso_total_kg', 'peso_total', 'total_kg', 'kilos_totales', 'peso_tot']),
      unitWeight: findBestColumn(headers, ['peso_unitario_kg', 'peso_unitario', 'peso_kg', 'peso', 'kilos']),
      paintArea: findBestColumn(headers, ['m2_pintura_por_unidad', 'm2_pintura', 'pintura_m2', 'area_pintura', 'pintura']),
      project: findBestColumn(headers, ['proyecto', 'project', 'obra']),
      steelGrade: findBestColumn(headers, ['acero', 'grado', 'grado_acero', 'steel_grade']),
      workOrder: findBestColumn(headers, ['ot', 'orden', 'orden_trabajo', 'op']),
      notes: findBestColumn(headers, ['observaciones', 'notas', 'notes', 'comentarios'])
    };

    setRawDataset(rawRows);
    setDetectedHeaders(headers);
    setColumnMapping(detectedMapping);
    setFileName(sourceName);

    const parsed = buildParsedRowsFromRaw(rawRows, detectedMapping, sourceName);
    setParsedRows(parsed);
    playFeedbackSound('success');
  };

  // User changes a column mapping in the UI
  const handleMappingChange = (field: keyof ColumnMapping, selectedHeader: string) => {
    const updatedMapping = { ...columnMapping, [field]: selectedHeader };
    setColumnMapping(updatedMapping);
    const updatedRows = buildParsedRowsFromRaw(rawDataset, updatedMapping, fileName || 'Archivo');
    setParsedRows(updatedRows);
    playFeedbackSound('click');
  };

  // User directly edits a cell in the preview table (e.g. adjusts mark or profile)
  const handleEditCell = (id: string, field: 'mark' | 'profile' | 'quantity' | 'lengthMeters', value: string) => {
    setParsedRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      if (field === 'mark') {
        const issues = row.issues.filter(i => !i.includes('Marca'));
        if (!value.trim()) issues.push('Marca no puede estar vacía');
        return { ...row, mark: value, isValid: issues.length === 0, issues };
      }
      if (field === 'profile') {
        const issues = row.issues.filter(i => !i.includes('Perfil'));
        if (!value.trim()) issues.push('Perfil no puede estar vacío');
        return { ...row, profile: value, isValid: issues.length === 0, issues };
      }
      if (field === 'quantity') {
        const q = parseInt(value, 10) || 1;
        return { ...row, quantity: q, balance: q };
      }
      if (field === 'lengthMeters') {
        const l = parseFloat(value.replace(',', '.')) || 0;
        return { ...row, lengthMeters: l };
      }
      return row;
    }));
  };

  // Excel / CSV File processing with multi-row intelligent header detection
  const processWorkbook = (workbook: XLSX.WorkBook, uploadedName: string) => {
    // Check available sheets
    let targetSheetName = workbook.SheetNames[0];
    // If multiple sheets, prefer one containing "despiece", "piezas", "bom", "materiales", or "lista"
    const descriptiveSheet = workbook.SheetNames.find(s => {
      const lower = s.toLowerCase();
      return lower.includes('despiece') || lower.includes('pieza') || lower.includes('bom') || lower.includes('material') || lower.includes('lista');
    });
    if (descriptiveSheet) {
      targetSheetName = descriptiveSheet;
    }

    const sheet = workbook.Sheets[targetSheetName];
    if (!sheet) {
      alert('El archivo Excel no contiene hojas válidas.');
      return;
    }

    // Convert sheet into 2D array of rows
    const rawMatrix: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rawMatrix || rawMatrix.length === 0) {
      alert('El archivo Excel seleccionado está vacío.');
      return;
    }

    // Scan first 15 rows to find the true table header row
    const headerKeywords = [
      'marca', 'mark', 'tag', 'pos', 'posicion', 'codigo', 'pieza', 'elemento', 'item', 'assembly',
      'perfil', 'profile', 'seccion', 'section', 'descripcion', 'desc', 'dimension', 'material',
      'longitud', 'length', 'largo', 'cantidad', 'cant', 'qty', 'peso', 'weight', 'kg', 'pintura', 'm2'
    ];

    let bestHeaderRowIndex = 0;
    let maxMatchScore = 0;

    for (let r = 0; r < Math.min(15, rawMatrix.length); r++) {
      const row = rawMatrix[r];
      if (!Array.isArray(row)) continue;
      let score = 0;
      for (const cell of row) {
        const str = String(cell || '').toLowerCase().trim();
        if (!str) continue;
        if (headerKeywords.some(k => str.includes(k))) {
          score++;
        }
      }
      if (score > maxMatchScore) {
        maxMatchScore = score;
        bestHeaderRowIndex = r;
      }
    }

    // Extract headers
    const headerRow = rawMatrix[bestHeaderRowIndex] || [];
    const headers: string[] = headerRow.map((cell: any, idx: number) => {
      const txt = String(cell || '').trim();
      return txt || `Columna_${idx + 1}`;
    });

    // Extract data rows below bestHeaderRowIndex
    const dataRows = rawMatrix.slice(bestHeaderRowIndex + 1);
    const rawObjects: Record<string, any>[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!Array.isArray(row) || row.length === 0) continue;
      
      // Check if entire row is empty
      const hasContent = row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
      if (!hasContent) continue;

      // Skip summary or total lines
      const firstCell = String(row[0] || '').trim().toUpperCase();
      if (firstCell === 'TOTAL' || firstCell === 'TOTALES' || firstCell === 'SUMA' || firstCell.startsWith('TOTAL:')) {
        continue;
      }

      const rowObj: Record<string, any> = {};
      headers.forEach((hdr, colIdx) => {
        rowObj[hdr] = row[colIdx] !== undefined ? row[colIdx] : '';
      });
      // Store 1-based original Excel row number
      rowObj['__excel_row_num'] = bestHeaderRowIndex + 1 + i + 1;
      rawObjects.push(rowObj);
    }

    if (rawObjects.length === 0) {
      alert('No se encontraron filas con datos de piezas bajo los encabezados detectados.');
      return;
    }

    initializeDataset(rawObjects, uploadedName);
  };

  const handleFileUpload = (file: File) => {
    // Check if JSON file
    if (file.name.endsWith('.json') || file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          const arrayData = Array.isArray(parsed) ? parsed : [parsed];
          initializeDataset(arrayData, file.name);
        } catch (err) {
          console.error('Error parsing JSON file:', err);
          alert('El archivo JSON no tiene un formato válido.');
          playFeedbackSound('error');
        }
      };
      reader.readAsText(file);
      return;
    }

    // Otherwise treat as Excel or CSV
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        processWorkbook(workbook, file.name);
      } catch (error) {
        console.error('Error al procesar archivo:', error);
        alert('Ocurrió un error al leer el archivo. Verifica que sea un Excel (.xlsx, .xls) o CSV válido.');
        playFeedbackSound('error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcessPastedJson = () => {
    if (!jsonText.trim()) {
      alert('Por favor pega un JSON o contenido de texto.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText.trim());
      const arrayData = Array.isArray(parsed) ? parsed : [parsed];
      initializeDataset(arrayData, 'Pegado_Directo_JSON');
    } catch (e) {
      // Tab-separated values from Excel clipboard
      try {
        const lines = jsonText.trim().split('\n');
        if (lines.length > 1) {
          const headers = lines[0].split('\t').map(h => h.trim());
          const rowsData = lines.slice(1).map((line, idx) => {
            const values = line.split('\t');
            const rowObj: Record<string, any> = {};
            headers.forEach((h, colIdx) => {
              rowObj[h] = values[colIdx] !== undefined ? values[colIdx].trim() : '';
            });
            rowObj['__excel_row_num'] = idx + 2;
            return rowObj;
          });
          initializeDataset(rowsData, 'Pegado_Portapapeles_Excel');
          return;
        }
      } catch (e2) {
        // ignore
      }

      alert('No se pudo interpretar el texto. Asegúrate de que sea un JSON válido o texto tabulado de Excel.');
      playFeedbackSound('error');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setParsedRows(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
    playFeedbackSound('click');
  };

  const handleToggleSelectAll = (select: boolean) => {
    setParsedRows(prev => prev.map(r => ({ ...r, selected: select })));
    playFeedbackSound('click');
  };

  // Template Downloader
  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    playFeedbackSound('click');
    const templateData = [
      {
        'marca': '1VP-1',
        'categoria': 'VIGAS PRINCIPALES',
        'descripcion': 'W 10 X 33',
        'longitud_m': 8.981,
        'unidad': 'unid',
        'cantidad': 12,
        'm2_pintura_por_unidad': 11.7,
        'peso_unitario_kg': 49.21,
        'peso_total_kg': 5303.46,
        'saldo': 12,
        'proyecto': 'Torre Mítica',
        'grado_acero': 'ASTM A992 Grado 50',
        'orden_trabajo': 'OT-2026-101',
        'observaciones': 'Pintura Epóxica 4 mils'
      },
      {
        'marca': '1CP-4',
        'categoria': 'COLUMNAS PRINCIPALES',
        'descripcion': 'W 12 X 65',
        'longitud_m': 6.450,
        'unidad': 'unid',
        'cantidad': 8,
        'm2_pintura_por_unidad': 9.2,
        'peso_unitario_kg': 96.73,
        'peso_total_kg': 4991.27,
        'saldo': 8,
        'proyecto': 'Torre Mítica',
        'grado_acero': 'ASTM A992 Grado 50',
        'orden_trabajo': 'OT-2026-101',
        'observaciones': 'Placa base en taller'
      },
      {
        'marca': 'J-302',
        'categoria': 'JOISTS',
        'descripcion': '24K8',
        'longitud_m': 12.00,
        'unidad': 'unid',
        'cantidad': 4,
        'm2_pintura_por_unidad': 14.5,
        'peso_unitario_kg': 30.0,
        'peso_total_kg': 1440.0,
        'saldo': 4,
        'proyecto': 'Mhotivo',
        'grado_acero': 'ASTM A36',
        'orden_trabajo': 'OT-2026-084',
        'observaciones': 'Contraflecha 15 mm'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Listado_Piezas');

    const fileNameOutput = `Plantilla_Piezas_Alanza.${format}`;
    XLSX.writeFile(wb, fileNameOutput, { bookType: format });
  };

  const handleConfirmImport = () => {
    const selectedRows = parsedRows.filter(r => r.selected);
    if (selectedRows.length === 0) {
      alert('Por favor selecciona al menos una pieza para importar.');
      return;
    }

    setIsProcessing(true);
    playFeedbackSound('click');

    setTimeout(() => {
      const piecesToCreate: Partial<Piece>[] = [];

      selectedRows.forEach(row => {
        const qty = Math.max(1, row.quantity || 1);
        const effectiveProject = overrideAllProject ? defaultProject : (row.project || defaultProject);
        const exactMark = row.mark.trim();
        const exactProfile = row.profile.trim();

        if (multiQuantityMode === 'consolidated' || qty === 1) {
          // Consolidated mode: 1 Piece entry with quantity = qty and balance = row.balance
          piecesToCreate.push({
            mark: exactMark,
            type: row.type,
            category: row.category,
            profile: exactProfile,
            description: row.description || `${row.category ? row.category + ' ' : ''}${exactProfile}`.trim(),
            lengthMeters: row.lengthMeters,
            weightKg: row.weightKg, // unit piece weight
            unitWeightKgPerMeter: row.unitWeightKgPerMeter,
            totalWeightKg: row.totalWeightKg,
            paintAreaM2: row.paintAreaM2,
            paintAreaTotalM2: row.paintAreaTotalM2,
            quantity: qty,
            balance: row.balance !== undefined ? row.balance : qty,
            excelRow: row.excelRow,
            project: effectiveProject,
            steelGrade: row.steelGrade,
            workOrder: row.workOrder,
            notes: row.notes,
            camberMm: row.camberMm,
            plateWidthMm: row.plateWidthMm,
            plateHeightMm: row.plateHeightMm,
            holeDiameterMm: row.holeDiameterMm,
            rodLengthMm: row.rodLengthMm,
            threadLengthMm: row.threadLengthMm
          });
        } else {
          // Split mode: Create individual units
          for (let i = 0; i < qty; i++) {
            // Keep identical mark or add numeric suffix based on user choice
            const itemMark = keepSameMarkInSplit ? exactMark : `${exactMark}-${String(i + 1).padStart(2, '0')}`;
            
            piecesToCreate.push({
              mark: itemMark,
              type: row.type,
              category: row.category,
              profile: exactProfile,
              description: row.description 
                ? `${row.description} (Unidad ${i + 1}/${qty})` 
                : `${exactProfile} (Unidad ${i + 1}/${qty})`,
              lengthMeters: row.lengthMeters,
              weightKg: row.weightKg,
              unitWeightKgPerMeter: row.unitWeightKgPerMeter,
              totalWeightKg: row.weightKg,
              paintAreaM2: row.paintAreaM2,
              paintAreaTotalM2: row.paintAreaM2,
              quantity: 1,
              balance: 1,
              excelRow: row.excelRow,
              project: effectiveProject,
              steelGrade: row.steelGrade,
              workOrder: row.workOrder,
              notes: row.notes ? `${row.notes} [Lote ${exactMark} - ${i + 1}/${qty}]` : `Lote ${exactMark} - Unidad ${i + 1}/${qty}`,
              camberMm: row.camberMm,
              plateWidthMm: row.plateWidthMm,
              plateHeightMm: row.plateHeightMm,
              holeDiameterMm: row.holeDiameterMm,
              rodLengthMm: row.rodLengthMm,
              threadLengthMm: row.threadLengthMm
            });
          }
        }
      });

      const result = addPiecesBatch(piecesToCreate);
      setIsProcessing(false);
      setImportSuccessCount(result.addedCount);
      playFeedbackSound('success');
    }, 450);
  };

  const selectedRowsList = parsedRows.filter(r => r.selected);
  const selectedCount = selectedRowsList.length;
  const totalItemsCount = selectedRowsList.reduce((acc, r) => acc + (multiQuantityMode === 'split' ? (Number(r.quantity) || 1) : 1), 0);
  const totalWeightKgSum = selectedRowsList.reduce((acc, r) => acc + (Number(r.totalWeightKg) || 0), 0);
  const totalWeightTon = (totalWeightKgSum / 1000).toFixed(2);
  const totalPaintAreaSum = selectedRowsList.reduce((acc, r) => acc + (Number(r.paintAreaTotalM2) || 0), 0);
  const totalPaintArea = totalPaintAreaSum.toFixed(1);

  const filteredDisplayRows = parsedRows.filter(row => {
    if (previewFilter === 'valid' && !row.isValid) return false;
    if (previewFilter === 'issues' && row.isValid) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      return (
        String(row.mark || '').toLowerCase().includes(term) ||
        String(row.type || '').toLowerCase().includes(term) ||
        String(row.profile || '').toLowerCase().includes(term) ||
        String(row.category || '').toLowerCase().includes(term) ||
        String(row.project || '').toLowerCase().includes(term) ||
        String(row.workOrder || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  if (!isImportPiecesModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-[#c3c6d7] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f8] flex items-center justify-between bg-gradient-to-r from-[#f0f3ff] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-md shadow-blue-900/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] sm:text-[20px] font-bold text-[#151c27] tracking-tight">
                  Importador de Despiece Estructural
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span>Excel</span>
                  <span>•</span>
                  <span>CSV</span>
                  <span>•</span>
                  <span>JSON</span>
                </span>
              </div>
              <p className="text-[12px] text-[#555f6f]">
                Preservación exacta de marcas de plano, perfiles estructurales, cubicación de pintura y peso total.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#555f6f] hover:text-[#151c27] hover:bg-[#e2e8f8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* Success screen after import */}
          {importSuccessCount !== null ? (
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-[22px] font-bold text-[#151c27]">
                ¡Importación Exitosa!
              </h3>
              <p className="text-[14px] text-[#555f6f] leading-relaxed">
                Se han generado y registrado <strong>{importSuccessCount} registros</strong> con sus marcas y perfiles exactamente como fueron leídos del archivo.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-[#004ac6] hover:bg-[#2563eb] text-white font-bold text-[13px] rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Ver Catálogo de Piezas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportSuccessCount(null);
                    setParsedRows([]);
                    setRawDataset([]);
                    setFileName(null);
                    setJsonText('');
                  }}
                  className="px-4 py-2.5 border border-[#c3c6d7] hover:bg-slate-100 text-[#151c27] font-semibold text-[13px] rounded-xl transition-colors cursor-pointer"
                >
                  Importar más piezas
                </button>
              </div>
            </div>
          ) : parsedRows.length === 0 ? (
            /* Upload & Input Zone */
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 border-b border-[#e2e8f8] pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('upload');
                    playFeedbackSound('click');
                  }}
                  className={`px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-[#004ac6] text-white shadow-xs'
                      : 'bg-[#f0f3ff] text-[#555f6f] hover:text-[#151c27] hover:bg-blue-100/50'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Subir Archivo (.xlsx, .csv, .json)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('paste');
                    playFeedbackSound('click');
                  }}
                  className={`px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'paste'
                      ? 'bg-[#004ac6] text-white shadow-xs'
                      : 'bg-[#f0f3ff] text-[#555f6f] hover:text-[#151c27] hover:bg-blue-100/50'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>Pegar JSON o Texto de Excel</span>
                </button>
              </div>

              {activeTab === 'upload' ? (
                /* Tab 1: Drag and Drop */
                <div className="space-y-4">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-11 text-center cursor-pointer transition-all ${
                      dragActive 
                        ? 'border-[#004ac6] bg-blue-50/70 scale-[1.01]' 
                        : 'border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f0f3ff]/50 bg-slate-50/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv, .json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#004ac6] mx-auto flex items-center justify-center mb-3 border border-blue-100 shadow-xs">
                      <UploadCloud className="w-8 h-8 animate-bounce duration-1000" />
                    </div>
                    <h3 className="text-[17px] font-bold text-[#151c27]">
                      Arrastra y suelta tu archivo Excel, CSV o JSON aquí
                    </h3>
                    <p className="text-[13px] text-[#555f6f] mt-1 mb-4 max-w-lg mx-auto">
                      Compatible con <strong>.xlsx, .xls, .csv y .json</strong>. Detecta automáticamente la fila de encabezados aunque haya títulos en las primeras filas.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-[13px] font-semibold shadow-xs">
                      <UploadCloud className="w-4 h-4" />
                      <span>Examinar en mi equipo</span>
                    </div>
                  </div>

                  {/* Template download helper */}
                  <div className="bg-[#f0f3ff] rounded-xl p-4 border border-[#dce2f3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white text-[#004ac6] border border-[#dce2f3] shrink-0 mt-0.5 sm:mt-0">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[13px] text-[#151c27]">
                          ¿Quieres una plantilla de referencia?
                        </h4>
                        <p className="text-[12px] text-[#555f6f]">
                          Descarga nuestra plantilla con columnas como <code>marca</code>, <code>descripcion</code> (o <code>perfil</code>), <code>longitud_m</code>, <code>peso_total_kg</code> y <code>m2_pintura_por_unidad</code>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('xlsx')}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-white border border-[#004ac6] text-[#004ac6] hover:bg-blue-50 font-bold text-[12px] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Descargar (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('csv')}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-white border border-[#c3c6d7] text-[#555f6f] hover:text-[#151c27] hover:bg-slate-100 font-semibold text-[12px] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tab 2: Paste JSON directly */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-bold text-[#151c27] flex items-center gap-1.5">
                      <FileCode2 className="w-4 h-4 text-[#004ac6]" />
                      <span>Pega tu JSON o filas tabuladas de Excel:</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setJsonText(SAMPLE_JSON_SNIPPET);
                        playFeedbackSound('click');
                      }}
                      className="text-[12px] text-[#004ac6] hover:text-[#2563eb] font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                      title="Carga el ejemplo con 1VP-1 y 1CP-4"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Cargar JSON de ejemplo (1VP-1)</span>
                    </button>
                  </div>

                  <textarea
                    rows={9}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder={`Pega aquí un objeto JSON individual o arreglo de objetos:\n{\n  "marca": "1VP-1",\n  "categoria": "VIGAS PRINCIPALES",\n  "descripcion": "W 10 X 33",\n  "longitud_m": 8.981,\n  "unidad": "unid",\n  "cantidad": 12,\n  "m2_pintura_por_unidad": 11.7,\n  "peso_unitario_kg": 49.21,\n  "peso_total_kg": 5303.46012,\n  "saldo": 12\n}`}
                    className="w-full p-3 font-mono text-[12px] bg-slate-50 border border-[#c3c6d7] rounded-xl focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#151c27] transition-all resize-y"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-[#555f6f]">
                      Soporta JSON <code>{`{...}`}</code>, arreglos <code>{`[...]`}</code> o celdas copiadas con Ctrl+C de Excel.
                    </p>
                    <button
                      type="button"
                      onClick={handleProcessPastedJson}
                      disabled={!jsonText.trim()}
                      className="px-5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white font-bold text-[13px] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Interpretar y Previsualizar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Supported Columns Guide */}
              <div className="border border-[#e2e8f8] rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex items-center gap-2 text-[#004ac6] font-bold text-[12px]">
                  <Info className="w-3.5 h-3.5" />
                  <span>Columnas reconocidas automáticamente por el motor:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#555f6f]">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong className="text-slate-800 block font-semibold">Marca:</strong>
                    <span><code>marca</code>, <code>mark</code>, <code>tag</code>, <code>pos</code></span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong className="text-slate-800 block font-semibold">Perfil / Sección:</strong>
                    <span><code>perfil</code>, <code>descripcion</code>, <code>seccion</code></span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong className="text-slate-800 block font-semibold">Longitud & Cantidad:</strong>
                    <span><code>longitud_m</code>, <code>cantidad</code>, <code>saldo</code></span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong className="text-slate-800 block font-semibold">Pesos & Pintura:</strong>
                    <span><code>peso_total_kg</code>, <code>peso_unitario_kg</code>, <code>m2_pintura</code></span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Preview & Configuration Screen */
            <div className="space-y-4">
              {/* File bar & Stats summary */}
              <div className="bg-[#f0f3ff] rounded-xl p-3.5 border border-[#dce2f3] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#151c27]">
                        {fileName}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        {parsedRows.length} filas leídas
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                        {detectedHeaders.length} columnas detectadas
                      </span>
                    </div>
                    <span className="text-[11px] text-[#555f6f] block">
                      Marcas y perfiles listos para revisión y ajuste antes de guardar.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMappingExpanded(!isMappingExpanded)}
                    className="px-3 py-1.5 bg-white border border-[#004ac6] text-[#004ac6] hover:bg-blue-50 font-bold text-[12px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Ajustar qué columna de tu Excel corresponde a Marca, Perfil, etc."
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Mapeo de Columnas</span>
                    {isMappingExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setParsedRows([]);
                      setRawDataset([]);
                      setFileName(null);
                      setJsonText('');
                    }}
                    className="px-3 py-1.5 bg-white border border-[#c3c6d7] text-[#555f6f] hover:text-[#151c27] hover:bg-slate-100 font-semibold text-[12px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cambiar archivo</span>
                  </button>
                </div>
              </div>

              {/* Interactive Column Mapping Panel */}
              {isMappingExpanded && detectedHeaders.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-blue-200 p-4 space-y-3 shadow-xs animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-[#004ac6]" />
                      <h4 className="font-bold text-[13px] text-[#151c27]">
                        Mapeo de Columnas de tu Excel
                      </h4>
                      <span className="text-[11px] text-[#555f6f]">
                        (Si tu archivo usa otros nombres de columna, cámbialos aquí y la tabla se actualizará al instante)
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Marca y Perfil se conservan 100% idénticos al archivo</span>
                    </div>
                  </div>

                  {/* Mapping Selectors Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[12px]">
                    
                    {/* 1. Columna de Marca */}
                    <div className="bg-[#f0f3ff] p-2.5 rounded-xl border border-blue-100">
                      <label className="font-bold text-[#004ac6] block mb-1 flex items-center justify-between">
                        <span>Columna para Marca:</span>
                        <Tag className="w-3 h-3 text-[#004ac6]" />
                      </label>
                      <select
                        value={columnMapping.mark}
                        onChange={(e) => handleMappingChange('mark', e.target.value)}
                        className="w-full py-1 px-2 bg-white border border-[#c3c6d7] rounded-lg font-mono font-bold text-[12px] text-[#151c27] focus:border-[#004ac6] outline-none"
                      >
                        <option value="">-- No mapear --</option>
                        {detectedHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      {rawDataset[0] && columnMapping.mark && (
                        <span className="text-[10px] text-slate-500 block mt-1 truncate">
                          Fila 1: <strong className="font-mono text-[#004ac6]">{String(rawDataset[0][columnMapping.mark] || '-')}</strong>
                        </span>
                      )}
                    </div>

                    {/* 2. Columna de Perfil / Descripción */}
                    <div className="bg-[#f0f3ff] p-2.5 rounded-xl border border-blue-100">
                      <label className="font-bold text-[#004ac6] block mb-1 flex items-center justify-between">
                        <span>Columna Perfil / Sección:</span>
                        <FileSpreadsheet className="w-3 h-3 text-[#004ac6]" />
                      </label>
                      <select
                        value={columnMapping.profile}
                        onChange={(e) => handleMappingChange('profile', e.target.value)}
                        className="w-full py-1 px-2 bg-white border border-[#c3c6d7] rounded-lg font-mono font-bold text-[12px] text-[#151c27] focus:border-[#004ac6] outline-none"
                      >
                        <option value="">-- No mapear --</option>
                        {detectedHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      {rawDataset[0] && columnMapping.profile && (
                        <span className="text-[10px] text-slate-500 block mt-1 truncate">
                          Fila 1: <strong className="font-mono text-[#151c27]">{String(rawDataset[0][columnMapping.profile] || '-')}</strong>
                        </span>
                      )}
                    </div>

                    {/* 3. Columna de Longitud */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <label className="font-semibold text-slate-700 block mb-1">
                        Columna Longitud (m):
                      </label>
                      <select
                        value={columnMapping.length}
                        onChange={(e) => handleMappingChange('length', e.target.value)}
                        className="w-full py-1 px-2 bg-white border border-[#c3c6d7] rounded-lg text-[12px] text-[#151c27] focus:border-[#004ac6] outline-none"
                      >
                        <option value="">-- No mapear --</option>
                        {detectedHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      {rawDataset[0] && columnMapping.length && (
                        <span className="text-[10px] text-slate-500 block mt-1 truncate">
                          Fila 1: <strong className="font-mono">{String(rawDataset[0][columnMapping.length] || '-')}</strong>
                        </span>
                      )}
                    </div>

                    {/* 4. Columna de Cantidad */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <label className="font-semibold text-slate-700 block mb-1">
                        Columna Cantidad:
                      </label>
                      <select
                        value={columnMapping.quantity}
                        onChange={(e) => handleMappingChange('quantity', e.target.value)}
                        className="w-full py-1 px-2 bg-white border border-[#c3c6d7] rounded-lg text-[12px] text-[#151c27] focus:border-[#004ac6] outline-none"
                      >
                        <option value="">-- No mapear --</option>
                        {detectedHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      {rawDataset[0] && columnMapping.quantity && (
                        <span className="text-[10px] text-slate-500 block mt-1 truncate">
                          Fila 1: <strong className="font-mono">{String(rawDataset[0][columnMapping.quantity] || '-')}</strong>
                        </span>
                      )}
                    </div>

                    {/* 5. Columna de Peso Total */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <label className="font-semibold text-slate-700 block mb-1">
                        Columna Peso Total (kg):
                      </label>
                      <select
                        value={columnMapping.totalWeight}
                        onChange={(e) => handleMappingChange('totalWeight', e.target.value)}
                        className="w-full py-1 px-2 bg-white border border-[#c3c6d7] rounded-lg text-[12px] text-[#151c27] focus:border-[#004ac6] outline-none"
                      >
                        <option value="">-- No mapear --</option>
                        {detectedHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      {rawDataset[0] && columnMapping.totalWeight && (
                        <span className="text-[10px] text-slate-500 block mt-1 truncate">
                          Fila 1: <strong className="font-mono">{String(rawDataset[0][columnMapping.totalWeight] || '-')}</strong>
                        </span>
                      )}
                    </div>

                    {/* 6. Columna de Peso Unitario */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <label className="font-semibold text-slate-700 block mb-1">
                        Columna Peso Unitario (kg o kg/m):
                      </label>
                      <select
                        value={columnMapping.unitWeight}
                        onChange={(e) => handleMappingChange('unitWeight', e.target.value)}
                        className="w-full py-1 px-2 bg-white border border-[#c3c6d7] rounded-lg text-[12px] text-[#151c27] focus:border-[#004ac6] outline-none"
                      >
                        <option value="">-- No mapear --</option>
                        {detectedHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      {rawDataset[0] && columnMapping.unitWeight && (
                        <span className="text-[10px] text-slate-500 block mt-1 truncate">
                          Fila 1: <strong className="font-mono">{String(rawDataset[0][columnMapping.unitWeight] || '-')}</strong>
                        </span>
                      )}
                    </div>

                    {/* 7. Columna de Área Pintura */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <label className="font-semibold text-slate-700 block mb-1">
                        Columna Pintura (m²/unid):
                      </label>
                      <select
                        value={columnMapping.paintArea}
                        onChange={(e) => handleMappingChange('paintArea', e.target.value)}
                        className="w-full py-1 px-2 bg-white border border-[#c3c6d7] rounded-lg text-[12px] text-[#151c27] focus:border-[#004ac6] outline-none"
                      >
                        <option value="">-- No mapear --</option>
                        {detectedHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      {rawDataset[0] && columnMapping.paintArea && (
                        <span className="text-[10px] text-slate-500 block mt-1 truncate">
                          Fila 1: <strong className="font-mono">{String(rawDataset[0][columnMapping.paintArea] || '-')}</strong>
                        </span>
                      )}
                    </div>

                    {/* 8. Columna de Categoría */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <label className="font-semibold text-slate-700 block mb-1">
                        Columna Categoría:
                      </label>
                      <select
                        value={columnMapping.category}
                        onChange={(e) => handleMappingChange('category', e.target.value)}
                        className="w-full py-1 px-2 bg-white border border-[#c3c6d7] rounded-lg text-[12px] text-[#151c27] focus:border-[#004ac6] outline-none"
                      >
                        <option value="">-- No mapear --</option>
                        {detectedHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      {rawDataset[0] && columnMapping.category && (
                        <span className="text-[10px] text-slate-500 block mt-1 truncate">
                          Fila 1: <strong className="font-mono">{String(rawDataset[0][columnMapping.category] || '-')}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Exact Preservation Options */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[12px]">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#151c27]">
                        <input
                          type="checkbox"
                          checked={preserveExactMarks}
                          onChange={(e) => {
                            setPreserveExactMarks(e.target.checked);
                            const updated = buildParsedRowsFromRaw(rawDataset, columnMapping, fileName || '');
                            setParsedRows(updated);
                          }}
                          className="rounded border-[#c3c6d7] text-[#004ac6] focus:ring-0 w-4 h-4"
                        />
                        <span>Preservar mayúsculas/minúsculas exactas de la Marca</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#151c27]">
                        <input
                          type="checkbox"
                          checked={preserveExactProfiles}
                          onChange={(e) => {
                            setPreserveExactProfiles(e.target.checked);
                            const updated = buildParsedRowsFromRaw(rawDataset, columnMapping, fileName || '');
                            setParsedRows(updated);
                          }}
                          className="rounded border-[#c3c6d7] text-[#004ac6] focus:ring-0 w-4 h-4"
                        />
                        <span>Preservar texto exacto del Perfil (sin modificar W, C, HSS, etc.)</span>
                      </label>
                    </div>

                    <span className="text-[11px] text-[#555f6f] italic">
                      Puedes editar marcas y perfiles directamente en la tabla de abajo si detectas algún error.
                    </span>
                  </div>
                </div>
              )}

              {/* Import Options Summary Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Batch / Split Mode */}
                <div className="bg-white p-3 rounded-xl border border-[#c3c6d7] space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#151c27] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#004ac6]" />
                      <span>Modo de Creación de Piezas:</span>
                    </span>
                    <span className="text-[11px] font-bold text-[#004ac6] bg-blue-50 px-2 py-0.5 rounded-md">
                      {multiQuantityMode === 'consolidated' ? '1 Ficha con Cantidad' : 'Unidades Desglosadas'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMultiQuantityMode('consolidated')}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        multiQuantityMode === 'consolidated'
                          ? 'border-[#004ac6] bg-blue-50/70 text-[#004ac6] font-bold'
                          : 'border-[#c3c6d7] text-[#555f6f] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5" />
                        <span>Consolidado por Marca</span>
                      </div>
                      <span className="text-[10px] font-normal opacity-80 block mt-0.5">
                        1 registro por fila con Cantidad = 12 y Saldo = 12 (Recomendado)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMultiQuantityMode('split')}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        multiQuantityMode === 'split'
                          ? 'border-[#004ac6] bg-blue-50/70 text-[#004ac6] font-bold'
                          : 'border-[#c3c6d7] text-[#555f6f] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Split className="w-3.5 h-3.5" />
                        <span>Desglosar Piezas Unitarias</span>
                      </div>
                      <span className="text-[10px] font-normal opacity-80 block mt-0.5">
                        Genera 12 piezas individuales con QR unitario
                      </span>
                    </button>
                  </div>

                  {multiQuantityMode === 'split' && (
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold">
                        <input
                          type="checkbox"
                          checked={keepSameMarkInSplit}
                          onChange={(e) => setKeepSameMarkInSplit(e.target.checked)}
                          className="rounded border-[#c3c6d7] text-[#004ac6] focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>Mantener la misma marca en todas las unidades (ej: <strong>1VP-1</strong>)</span>
                      </label>
                      <span className="text-slate-400">
                        {keepSameMarkInSplit ? 'Marca idéntica' : 'Sufijo 1VP-1-01, 1VP-1-02...'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Global Project Assignment Setting */}
                <div className="bg-white p-3 rounded-xl border border-[#c3c6d7] flex flex-col justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#004ac6]" />
                    <div>
                      <span className="text-[12px] font-bold text-[#151c27] block">
                        Proyecto de Destino:
                      </span>
                      <span className="text-[11px] text-[#555f6f]">
                        {overrideAllProject 
                          ? 'Todas las piezas se asignarán forzosamente al proyecto seleccionado.'
                          : 'Se respeta el proyecto indicado en cada fila o se asigna el seleccionado.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={defaultProject}
                      onChange={(e) => setDefaultProject(e.target.value)}
                      className="flex-1 py-1.5 px-3 bg-[#f0f3ff] border border-[#c3c6d7] rounded-lg text-[12px] font-semibold text-[#151c27] focus:outline-none focus:border-[#004ac6]"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>

                    <label className="flex items-center gap-1.5 text-[11px] text-[#555f6f] font-semibold cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={overrideAllProject}
                        onChange={(e) => setOverrideAllProject(e.target.checked)}
                        className="rounded border-[#c3c6d7] text-[#004ac6] focus:ring-0 w-3.5 h-3.5"
                      />
                      <span>Asignar a todas</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Table Controls (Filter & Search) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-1 bg-[#f0f3ff] p-1 rounded-lg border border-[#dce2f3] text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('all')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      previewFilter === 'all' ? 'bg-white font-bold text-[#004ac6] shadow-xs' : 'text-[#555f6f] hover:text-[#151c27]'
                    }`}
                  >
                    Todas ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('valid')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      previewFilter === 'valid' ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-[#555f6f] hover:text-[#151c27]'
                    }`}
                  >
                    Válidas ({parsedRows.filter(r => r.isValid).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('issues')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      previewFilter === 'issues' ? 'bg-white font-bold text-amber-700 shadow-xs' : 'text-[#555f6f] hover:text-[#151c27]'
                    }`}
                  >
                    Con Avisos ({parsedRows.filter(r => !r.isValid).length})
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar marca (1VP-1), perfil..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 bg-white border border-[#c3c6d7] rounded-lg text-[12px] text-[#151c27] focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSelectAll(selectedCount !== parsedRows.length)}
                    className="px-2.5 py-1 bg-white border border-[#c3c6d7] hover:bg-slate-50 text-[11px] font-semibold text-[#151c27] rounded-lg whitespace-nowrap cursor-pointer"
                  >
                    {selectedCount === parsedRows.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                  </button>
                </div>
              </div>

              {/* Data Preview Table with In-line Editable Cells */}
              <div className="border border-[#c3c6d7] rounded-xl overflow-hidden bg-white shadow-xs max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[12px]">
                  <thead className="bg-[#f0f3ff] text-[#555f6f] font-bold border-b border-[#e2e8f8] sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCount === parsedRows.length && parsedRows.length > 0}
                          onChange={(e) => handleToggleSelectAll(e.target.checked)}
                          className="rounded border-[#c3c6d7] text-[#004ac6] focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="p-2.5">
                        <div className="flex items-center gap-1">
                          <span>Marca</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-normal">Exacta</span>
                        </div>
                      </th>
                      <th className="p-2.5">Categoría / Tipo</th>
                      <th className="p-2.5">
                        <div className="flex items-center gap-1">
                          <span>Perfil / Sección</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-normal">Exacto</span>
                        </div>
                      </th>
                      <th className="p-2.5 text-right">Longitud</th>
                      <th className="p-2.5 text-center">Cant. / Saldo</th>
                      <th className="p-2.5 text-right">Pintura (m²/u)</th>
                      <th className="p-2.5 text-right">Peso Unit.</th>
                      <th className="p-2.5 text-right">Peso Total</th>
                      <th className="p-2.5">Proyecto</th>
                      <th className="p-2.5 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f8]">
                    {filteredDisplayRows.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-6 text-center text-[#555f6f] text-[13px]">
                          No hay elementos que coincidan con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredDisplayRows.map((row) => (
                        <tr
                          key={row.id}
                          className={`hover:bg-[#f0f3ff]/60 transition-colors ${
                            row.selected ? 'bg-blue-50/20' : 'opacity-60 bg-slate-50/40'
                          }`}
                        >
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              onChange={() => handleToggleSelectRow(row.id)}
                              className="rounded border-[#c3c6d7] text-[#004ac6] focus:ring-0 cursor-pointer"
                            />
                          </td>
                          
                          {/* Marca (Inline Editable) */}
                          <td className="p-2">
                            <div className="flex flex-col">
                              <input
                                type="text"
                                value={row.mark}
                                onChange={(e) => handleEditCell(row.id, 'mark', e.target.value)}
                                className="w-28 font-mono font-bold text-[#004ac6] bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#004ac6] border border-transparent hover:border-slate-300 rounded px-1.5 py-0.5 outline-none transition-all"
                                title="Marca exacta del archivo (haz clic para editar si es necesario)"
                              />
                              {row.excelRow && (
                                <span className="text-[10px] text-slate-400 pl-1.5 font-normal">Fila {row.excelRow}</span>
                              )}
                            </div>
                          </td>

                          {/* Categoría / Tipo */}
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold block">
                              {row.type}
                            </span>
                            {row.category && (
                              <span className="text-[10px] text-[#555f6f] truncate max-w-[130px] block" title={row.category}>
                                {row.category}
                              </span>
                            )}
                          </td>

                          {/* Perfil / Sección (Inline Editable) */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.profile}
                              onChange={(e) => handleEditCell(row.id, 'profile', e.target.value)}
                              className="w-32 font-mono font-semibold text-[#151c27] bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#004ac6] border border-transparent hover:border-slate-300 rounded px-1.5 py-0.5 outline-none transition-all"
                              title="Perfil exacto del archivo (haz clic para editar si es necesario)"
                            />
                          </td>

                          {/* Longitud */}
                          <td className="p-2.5 text-right font-mono">
                            {(Number(row.lengthMeters) || 0).toFixed(3)} m
                          </td>

                          {/* Cantidad / Saldo */}
                          <td className="p-2.5 text-center font-bold">
                            <span className="text-slate-800">{row.quantity}</span>
                            {row.balance !== undefined && (
                              <span className="text-[10px] text-emerald-700 block font-normal">
                                Saldo: {row.balance}
                              </span>
                            )}
                          </td>

                          {/* Pintura */}
                          <td className="p-2.5 text-right font-mono">
                            {row.paintAreaM2 !== undefined && row.paintAreaM2 !== null ? (
                              <div>
                                <span className="font-semibold text-blue-900">{Number(row.paintAreaM2).toFixed(2)} m²</span>
                                {row.quantity > 1 && (
                                  <span className="text-[10px] text-[#555f6f] block">
                                    Total: {Number(row.paintAreaTotalM2 || 0).toFixed(2)} m²
                                  </span>
                                )}
                              </div>
                            ) : '-'}
                          </td>

                          {/* Peso Unitario */}
                          <td className="p-2.5 text-right font-mono">
                            <span className="font-semibold text-[#151c27]">{(Number(row.weightKg) || 0).toLocaleString()} kg</span>
                            {row.unitWeightKgPerMeter !== undefined && row.unitWeightKgPerMeter !== null && (
                              <span className="text-[10px] text-[#555f6f] block">
                                ({Number(row.unitWeightKgPerMeter).toFixed(2)} kg/m)
                              </span>
                            )}
                          </td>

                          {/* Peso Total */}
                          <td className="p-2.5 text-right font-mono font-bold text-amber-900">
                            {(Number(row.totalWeightKg) || 0).toLocaleString()} kg
                          </td>

                          {/* Proyecto */}
                          <td className="p-2.5 text-[#555f6f] truncate max-w-[120px]" title={overrideAllProject ? defaultProject : row.project}>
                            {overrideAllProject ? defaultProject : row.project}
                          </td>

                          {/* Estado */}
                          <td className="p-2.5 text-center">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Lista</span>
                              </span>
                            ) : (
                              <span 
                                className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]" 
                                title={row.issues.join(', ')}
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Aviso</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {importSuccessCount === null && parsedRows.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#e2e8f8] bg-[#f0f3ff]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[12px] text-[#555f6f] text-center sm:text-left">
              {multiQuantityMode === 'consolidated' ? (
                <span>Se registrarán <strong>{selectedCount} fichas de marca consolidada</strong> manteniendo sus marcas y perfiles exactos.</span>
              ) : (
                <span>Se registrarán <strong>{totalItemsCount} piezas individuales</strong> {keepSameMarkInSplit ? 'manteniendo la misma marca' : 'con sufijo correlativo'}.</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1 sm:flex-initial px-4 py-2 border border-[#c3c6d7] hover:bg-white text-[#151c27] text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isProcessing || selectedCount === 0}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#004ac6] hover:bg-[#2563eb] text-white font-bold text-[13px] rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                id="btn-confirm-import-pieces"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Procesando e Importando...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar e Importar {multiQuantityMode === 'split' ? `${totalItemsCount} Piezas` : `${selectedCount} Registros`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
