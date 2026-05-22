import * as XLSX from 'xlsx';
import type { ExportReadyReport } from '@/lib/engine/ExportPreparationEngine';

type ExportArtifact = ExportReadyReport & {
  selected_documents?: string[];
  export_format?: string;
  review_version_status?: string;
  is_locked?: boolean;
  lock_state?: string;
};

type SheetRow = Array<string | number | null>;

const STATEMENT_KEYS = new Set(['statements', 'bilan', 'actif', 'passif', 'cr', 'income_statement', 'cashflow', 'cash_flow']);
const NOTES_KEYS = new Set(['notes']);
const EXPENSE_KEYS = new Set(['expense_details', 'detail_charges', 'charges']);
const FISCAL_KEYS = new Set(['fiscal_forms', 'fiscal', 'dgi', 'dni', 'bic', 'bv', 'patente', 'honoraires']);
const REVIEW_KEYS = new Set(['review_pack', 'validation', 'traceability']);

function hasSelection(selected: string[], keys: Set<string>) {
  return selected.some((key) => keys.has(key));
}

function sheetName(name: string) {
  return name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31);
}

function numberValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function displayValue(value: unknown): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  return JSON.stringify(value);
}

function reportLineRows(title: string, report: { lines?: Array<{
  line_code?: string;
  label_fr?: string;
  label_en?: string;
  section_code?: string;
  value_N?: number | null;
  value_N_1?: number | null;
  variation_amount?: number | null;
  variation_percentage?: number | null;
  formula_used?: string;
  source_accounts?: Array<{ account_number?: string }>;
}> } | undefined): SheetRow[] {
  const rows: SheetRow[] = [
    [title],
    ['Code', 'Libelle', 'Section', 'N', 'N-1', 'Variation', 'Variation %', 'Formule', 'Source comptes'],
  ];

  for (const line of report?.lines ?? []) {
    rows.push([
      displayValue(line.line_code),
      displayValue(line.label_fr ?? line.label_en),
      displayValue(line.section_code),
      numberValue(line.value_N),
      numberValue(line.value_N_1),
      numberValue(line.variation_amount),
      numberValue(line.variation_percentage),
      displayValue(line.formula_used),
      Array.isArray(line.source_accounts) ? line.source_accounts.map((source) => source.account_number).join(', ') : '',
    ]);
  }

  return rows;
}

function noteRows(notes: ExportArtifact['notes']): SheetRow[] {
  const rows: SheetRow[] = [
    ['Notes annexes'],
    ['Note', 'Titre', 'Statut', 'Validation', 'Champ', 'Valeur', 'Manuel', 'Obligatoire', 'Formule'],
  ];
  for (const note of notes ?? []) {
    for (const field of note.fields ?? []) {
      rows.push([
        note.note_number,
        note.title_fr,
        note.status,
        note.validation_result,
        field.label_fr,
        displayValue(field.value),
        field.is_manual ? 'Oui' : 'Non',
        field.required ? 'Oui' : 'Non',
        note.calculation_formula,
      ]);
    }
  }
  return rows;
}

function expenseRows(expense: ExportArtifact['expense_details']): SheetRow[] {
  const rows: SheetRow[] = [
    ['Detail des charges'],
    ['Categorie', 'Libelle', 'Montant N', 'Montant N-1', 'Variation', 'Traitement fiscal', 'Comptes sources'],
  ];
  for (const category of expense?.categories ?? []) {
    rows.push([
      category.code,
      category.label_fr,
      category.amount_N,
      category.amount_N1,
      category.variation,
      category.fiscal_treatment,
      category.lines.map((line) => line.account_number).join(', '),
    ]);
    for (const line of category.lines) {
      rows.push([
        `  ${line.account_number}`,
        line.account_label,
        line.amount_N,
        line.amount_N1,
        line.variation,
        line.fiscal_treatment,
        '',
      ]);
    }
  }
  rows.push([]);
  rows.push(['Total charges', '', expense?.total_expenses_N ?? 0, expense?.total_expenses_N1 ?? null]);
  rows.push(['Total à revoir fiscalement', '', expense?.fiscal_review_total_N ?? 0]);
  rows.push(['Total non deductible', '', expense?.non_deductible_total_N ?? 0]);
  return rows;
}

function fiscalLineRows(title: string, lines: Array<{
  line_code?: string;
  label_fr?: string;
  label_en?: string;
  value?: number | null;
  is_manual?: boolean;
  source?: string;
  comment?: string;
}> | undefined): SheetRow[] {
  const rows: SheetRow[] = [[title], ['Code', 'Libelle', 'Valeur', 'Manuel', 'Source', 'Commentaire']];
  for (const line of lines ?? []) {
    rows.push([
      displayValue(line.line_code),
      displayValue(line.label_fr ?? line.label_en),
      numberValue(line.value),
      line.is_manual ? 'Oui' : 'Non',
      displayValue(line.source),
      displayValue(line.comment),
    ]);
  }
  return rows;
}

function fiscalRows(fiscal: ExportArtifact['fiscal']): SheetRow[] {
  const rows: SheetRow[] = [
    ['Fiscal'],
    ['Rubrique', 'Valeur'],
    ['Resultat comptable', fiscal?.accounting_result ?? null],
    ['Total reintegrations', fiscal?.total_add_backs ?? 0],
    ['Total deductions', fiscal?.total_deductions ?? 0],
    ['Resultat fiscal', fiscal?.taxable_result ?? 0],
    ['Benefice imposable', fiscal?.taxable_profit ?? 0],
    ['Deficit genere', fiscal?.deficit_generated ?? 0],
    ['Taux IS', fiscal?.tax_rate ?? 0],
    ['IS calcule', fiscal?.calculated_tax ?? 0],
    ['Acomptes payes', fiscal?.installments_paid ?? 0],
    ['Credits d impot', fiscal?.tax_credits ?? 0],
    ['Solde a payer', fiscal?.balance_payable ?? 0],
    ['Patente total', fiscal?.patente_total ?? 0],
    ['Honoraires total', fiscal?.honoraire_total ?? 0],
    ['Retenue honoraires', fiscal?.honoraire_withholding_total ?? 0],
    [],
    ...fiscalLineRows('Reintegrations', fiscal?.add_backs),
    [],
    ...fiscalLineRows('Deductions', fiscal?.deductions),
    [],
    ...fiscalLineRows('DNI', fiscal?.dni_lines),
    [],
    ...fiscalLineRows('Patente', fiscal?.patente_lines),
    [],
    ...fiscalLineRows('Honoraires', fiscal?.honoraire_lines),
  ];

  for (const schedule of fiscal?.bic_pages ?? []) {
    rows.push([], [schedule.title_fr], ['Code', 'Libelle', 'Valeur']);
    for (const line of schedule.lines) {
      rows.push([line.line_code, line.label_fr, line.value]);
    }
    rows.push(['Total', '', schedule.total]);
  }

  if (fiscal?.bv_schedule) {
    rows.push([], [fiscal.bv_schedule.title_fr], ['Code', 'Libelle', 'Valeur']);
    for (const line of fiscal.bv_schedule.lines) {
      rows.push([line.line_code, line.label_fr, line.value]);
    }
    rows.push(['Total', '', fiscal.bv_schedule.total]);
  }

  return rows;
}

function validationRows(artifact: ExportArtifact): SheetRow[] {
  const rows: SheetRow[] = [
    ['Validation'],
    ['Categorie', 'Severite', 'Message', 'Code', 'Action'],
  ];
  for (const category of artifact.validation_report?.categories ?? []) {
    for (const message of category.messages ?? []) {
      rows.push([
        category.category,
        message.severity,
        message.message_fr,
        message.code,
        message.fix_target ?? message.fix_type ?? '',
      ]);
    }
  }
  return rows;
}

function traceabilityRows(artifact: ExportArtifact): SheetRow[] {
  const rows: SheetRow[] = [
    ['Traceabilite'],
    ['Etat', 'Ligne', 'Libelle', 'Valeur N', 'Valeur N-1', 'Comptes sources', 'Formule', 'Ajustement manuel'],
  ];
  for (const item of artifact.traceability ?? []) {
    rows.push([
      item.report_type,
      item.line_code,
      item.label ?? '',
      item.value_N,
      item.value_N_1,
      item.source_accounts.map((account) => account.account_number).join(', '),
      item.formula_used,
      item.is_manual_override ? 'Oui' : 'Non',
    ]);
  }
  return rows;
}

function metadataRows(artifact: ExportArtifact, selected: string[]): SheetRow[] {
  return [
    ['Dossier statutaire OHADA'],
    ['Société', artifact.company_name],
    ['Exercice', artifact.fiscal_year_label],
    ['Devise', artifact.currency_code],
    ['Version', artifact.version_id],
    ['Calcul', artifact.calculation_run_id],
    ['Genere le', artifact.generated_at],
    ['Documents selectionnes', selected.join(', ')],
    ['Statut revision', artifact.review_version_status ?? ''],
    ['Etat verrouillage', artifact.lock_state ?? (artifact.is_locked ? 'locked' : 'unlocked')],
  ];
}

function addSheet(workbook: XLSX.WorkBook, name: string, rows: SheetRow[]) {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = rows[1]?.map(() => ({ wch: 22 })) ?? [{ wch: 22 }];
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName(name));
}

export function buildExportWorkbookBuffer(artifact: ExportArtifact, selected: string[]) {
  const workbook = XLSX.utils.book_new();
  addSheet(workbook, 'Page de garde', metadataRows(artifact, selected));

  if (hasSelection(selected, STATEMENT_KEYS)) {
    addSheet(workbook, 'Actif', reportLineRows('Actif SYSCOHADA', artifact.actif));
    addSheet(workbook, 'Passif', reportLineRows('Passif SYSCOHADA', artifact.passif));
    addSheet(workbook, 'Compte resultat', reportLineRows('Compte de resultat', artifact.income_statement));
    addSheet(workbook, 'Flux tresorerie', reportLineRows('Tableau de flux de tresorerie', artifact.cash_flow));
  }
  if (hasSelection(selected, NOTES_KEYS)) addSheet(workbook, 'Notes annexes', noteRows(artifact.notes));
  if (hasSelection(selected, EXPENSE_KEYS)) addSheet(workbook, 'Detail charges', expenseRows(artifact.expense_details));
  if (hasSelection(selected, FISCAL_KEYS)) addSheet(workbook, 'Fiscal DGI', fiscalRows(artifact.fiscal));
  if (hasSelection(selected, REVIEW_KEYS)) {
    addSheet(workbook, 'Validation', validationRows(artifact));
    addSheet(workbook, 'Traceabilite', traceabilityRows(artifact));
  }

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer;
}

function wrapLine(line: string, width = 92) {
  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7E]/g, '?');
}

function rowsToText(rows: SheetRow[]) {
  return rows.map((row) => row.map((cell) => displayValue(cell) ?? '').join(' | '));
}

function makePdfLines(artifact: ExportArtifact, selected: string[]) {
  const sections: Array<{ title: string; rows: SheetRow[] }> = [
    { title: 'Page de garde', rows: metadataRows(artifact, selected) },
  ];
  if (hasSelection(selected, STATEMENT_KEYS)) {
    sections.push({ title: 'Actif', rows: reportLineRows('Actif SYSCOHADA', artifact.actif) });
    sections.push({ title: 'Passif', rows: reportLineRows('Passif SYSCOHADA', artifact.passif) });
    sections.push({ title: 'Compte resultat', rows: reportLineRows('Compte de resultat', artifact.income_statement) });
    sections.push({ title: 'Flux tresorerie', rows: reportLineRows('Tableau de flux de tresorerie', artifact.cash_flow) });
  }
  if (hasSelection(selected, NOTES_KEYS)) sections.push({ title: 'Notes annexes', rows: noteRows(artifact.notes) });
  if (hasSelection(selected, EXPENSE_KEYS)) sections.push({ title: 'Detail charges', rows: expenseRows(artifact.expense_details) });
  if (hasSelection(selected, FISCAL_KEYS)) sections.push({ title: 'Fiscal DGI', rows: fiscalRows(artifact.fiscal) });
  if (hasSelection(selected, REVIEW_KEYS)) {
    sections.push({ title: 'Validation', rows: validationRows(artifact) });
    sections.push({ title: 'Traceabilite', rows: traceabilityRows(artifact) });
  }

  const lines: string[] = [];
  for (const section of sections) {
    lines.push(section.title.toUpperCase(), '');
    for (const row of rowsToText(section.rows).slice(1)) {
      lines.push(...wrapLine(row));
    }
    lines.push('', '');
  }
  return lines;
}

export function buildExportPdfBuffer(artifact: ExportArtifact, selected: string[]) {
  const lines = makePdfLines(artifact, selected);
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += 58) pages.push(lines.slice(i, i + 58));
  if (pages.length === 0) pages.push(['Dossier statutaire OHADA']);

  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];
  const fontObjectNumber = 3 + pages.length * 2;

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  for (let i = 0; i < pages.length; i += 1) {
    const pageObjectNumber = 3 + i * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    pageObjectNumbers.push(pageObjectNumber);
    const streamLines = [
      'BT',
      '/F1 8 Tf',
      '36 805 Td',
      '11 TL',
      ...pages[i].map((line, index) => `${index === 0 ? '' : 'T* '}(${pdfEscape(line)}) Tj`),
      'ET',
    ];
    const stream = streamLines.join('\n');
    objects[pageObjectNumber] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    objects[contentObjectNumber] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`;
  }
  objects[2] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  objects[fontObjectNumber] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 1; i < objects.length; i += 1) {
    if (!objects[i]) continue;
    offsets[i] = Buffer.byteLength(pdf);
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i += 1) {
    pdf += `${String(offsets[i] ?? 0).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'binary');
}

function crc32(buffer: Buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function uint16(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function uint32(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

export function buildZipBuffer(files: Array<{ name: string; data: Buffer }>) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.name);
    const checksum = crc32(file.data);
    const localHeader = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(checksum),
      uint32(file.data.length),
      uint32(file.data.length),
      uint16(name.length),
      uint16(0),
      name,
    ]);
    localParts.push(localHeader, file.data);

    centralParts.push(Buffer.concat([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(checksum),
      uint32(file.data.length),
      uint32(file.data.length),
      uint16(name.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(offset),
      name,
    ]));
    offset += localHeader.length + file.data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(files.length),
    uint16(files.length),
    uint32(centralDirectory.length),
    uint32(offset),
    uint16(0),
  ]);

  return Buffer.concat([...localParts, centralDirectory, end]);
}
