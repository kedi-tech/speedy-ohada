import XLSX from 'xlsx';

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:3000';
const workbookPath = process.argv[2] || 'D:/documents/Balances.xlsx';
const email = process.env.OHADA_TEST_EMAIL || 'sleekhub@gmail.com';
const password = process.env.OHADA_TEST_PASSWORD || 'Sleekhub@123';
const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const steps = [];

function log(name, status, details = '') {
  steps.push({ name, status, details });
  console.log(`${status === 'pass' ? 'PASS' : status === 'warn' ? 'WARN' : 'FAIL'} ${name}${details ? ` - ${details}` : ''}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(options.cookie ? { Cookie: options.cookie } : {}),
      ...(options.headers ?? {}),
    },
  });
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const json = await response.json();
    return { response, data: json };
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return { response, data: buffer };
}

function normalizeHeader(header) {
  return String(header ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[Âº°]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanRows(rows) {
  return rows
    .map((row) => row.map((cell) => cell ?? ''))
    .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''));
}

function findHeaderRowIndex(rows) {
  const limit = Math.min(rows.length, 20);
  for (let i = 0; i < limit; i += 1) {
    const normalized = rows[i].map((cell) => normalizeHeader(cell));
    const hasAccount = normalized.some((cell) => cell.includes('compte') || cell === 'code');
    const hasLabel = normalized.some((cell) => cell.includes('libelle') || cell.includes('label') || cell.includes('intitule'));
    if (hasAccount && hasLabel) return i;
  }
  return 0;
}

function toNumber(value) {
  const raw = String(value ?? '').trim().replace(/\s/g, '');
  const cleaned = raw.includes(',') && raw.includes('.')
    ? raw.replace(/,/g, '')
    : raw.split(',').length > 2
      ? raw.replace(/,/g, '')
      : /,\d{3}$/.test(raw)
        ? raw.replace(/,/g, '')
        : raw.replace(',', '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseBalanceSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Missing sheet ${sheetName}`);
  let rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
  rows = cleanRows(rows).slice(findHeaderRowIndex(rows));
  const dataRows = rows.slice(1);
  const rawLines = dataRows.map((row, index) => ({
    row_index: index + 1,
    account_number: String(row[0] ?? '').trim(),
    account_label: String(row[1] ?? '').trim(),
    opening_debit: toNumber(row[2]),
    opening_credit: toNumber(row[3]),
    movement_debit: toNumber(row[4]),
    movement_credit: toNumber(row[5]),
    closing_debit: toNumber(row[6]),
    closing_credit: toNumber(row[7]),
  })).filter((line) => /^[0-9]/.test(line.account_number));

  const totals = rawLines.reduce((acc, line) => {
    acc.debit += line.closing_debit;
    acc.credit += line.closing_credit;
    return acc;
  }, { debit: 0, credit: 0 });
  return { rawLines, totals, difference: totals.debit - totals.credit };
}

function assertOk(name, response, data) {
  if (!response.ok) {
    throw new Error(`${name} failed with ${response.status}: ${JSON.stringify(data).slice(0, 500)}`);
  }
}

const workbook = XLSX.readFile(workbookPath);
const n1 = parseBalanceSheet(workbook, 'N-1');
const n = parseBalanceSheet(workbook, 'N');
log('Read workbook', 'pass', `${workbook.SheetNames.join(', ')}; N=${n.rawLines.length}; N-1=${n1.rawLines.length}`);
log('Workbook N balance', Math.abs(n.difference) <= 1 ? 'pass' : 'warn', `debit=${n.totals.debit}; credit=${n.totals.credit}; diff=${n.difference}`);
log('Workbook N-1 balance', Math.abs(n1.difference) <= 1 ? 'pass' : 'warn', `debit=${n1.totals.debit}; credit=${n1.totals.credit}; diff=${n1.difference}`);

const login = await request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
assertOk('login', login.response, login.data);
const cookie = `ohada_user=${encodeURIComponent(JSON.stringify(login.data.user))}`;
log('Login', 'pass', `${login.data.user.email} (${login.data.user.role})`);

const companyPayload = {
  name: `Balance Test ${runId}`,
  legalName: `Balance Test ${runId} SARL`,
  sector: 'Services',
  city: 'Conakry',
  country: 'GN',
  currency: 'GNF',
  accountingStandard: 'SYSCOHADA',
  taxRegime: 'BIC',
};
const company = await request('/api/companies', {
  method: 'POST',
  cookie,
  body: JSON.stringify(companyPayload),
});
assertOk('create company', company.response, company.data);
log('Create company', 'pass', company.data.company.id);

const fiscalYear = await request('/api/fiscal-years', {
  method: 'POST',
  cookie,
  body: JSON.stringify({
    companyId: company.data.company.id,
    label: `FY 2025 Balance Test ${runId}`,
    yearN: 2025,
    yearN1: 2024,
    openingDate: '2025-01-01',
    closingDate: '2025-12-31',
    currency: 'GNF',
  }),
});
assertOk('create fiscal year', fiscalYear.response, fiscalYear.data);
const fiscalYearId = fiscalYear.data.fiscalYear.id;
log('Create fiscal year', 'pass', fiscalYearId);

const importN1 = await request('/api/trial-balance/import', {
  method: 'POST',
  cookie,
  body: JSON.stringify({
    fiscalYearId,
    balanceType: 'N-1',
    rawLines: n1.rawLines,
    fileName: workbookPath.split(/[\\/]/).pop(),
    columnMap: {},
  }),
});
assertOk('import N-1', importN1.response, importN1.data);
log('Import N-1', 'pass', `${importN1.data.importedRows} rows; grouped=${importN1.data.groupedRows}; balanced=${importN1.data.summary.is_balanced}`);

const importN = await request('/api/trial-balance/import', {
  method: 'POST',
  cookie,
  body: JSON.stringify({
    fiscalYearId,
    balanceType: 'N',
    rawLines: n.rawLines,
    fileName: workbookPath.split(/[\\/]/).pop(),
    columnMap: {},
  }),
});
assertOk('import N', importN.response, importN.data);
log('Import N', 'pass', `${importN.data.importedRows} rows; grouped=${importN.data.groupedRows}; balanced=${importN.data.summary.is_balanced}`);

const grouped = await request(`/api/grouped-balance?fiscalYearId=${encodeURIComponent(fiscalYearId)}`, { cookie });
assertOk('grouped balance', grouped.response, grouped.data);
log('Grouped balance', 'pass', `${grouped.data.rows?.length ?? 0} rows`);

const calculation = await request('/api/calculations/run', {
  method: 'POST',
  cookie,
  body: JSON.stringify({ fiscalYearId, triggerReason: 'balances_e2e_test' }),
});
assertOk('run calculation', calculation.response, calculation.data);
log('Run calculation', 'pass', `canExport=${calculation.data.validation.can_export}; critical=${calculation.data.validation.total_critical}; warnings=${calculation.data.validation.total_warnings}`);

const latest = await request(`/api/calculations/latest?fiscalYearId=${encodeURIComponent(fiscalYearId)}`, { cookie });
assertOk('latest calculation', latest.response, latest.data);
log('Latest calculation API', 'pass', `run=${latest.data.run?.id ?? latest.data.snapshot?.calculation_run_id ?? 'available'}`);

const reviewBefore = await request(`/api/report-versions?fiscalYearId=${encodeURIComponent(fiscalYearId)}`, { cookie });
assertOk('review state', reviewBefore.response, reviewBefore.data);
log('Review state loads', 'pass', `latestRun=${reviewBefore.data.latestRun?.id ?? 'none'}`);

const approve = await request('/api/report-versions', {
  method: 'POST',
  cookie,
  body: JSON.stringify({ fiscalYearId, action: 'approve', comment: 'Automated balance workbook smoke test' }),
});
assertOk('approve review', approve.response, approve.data);
log('Approve review', 'pass', approve.data.version.status);

const exportReadiness = await request(`/api/export?fiscalYearId=${encodeURIComponent(fiscalYearId)}`, { cookie });
assertOk('export readiness', exportReadiness.response, exportReadiness.data);
log('Export readiness loads', exportReadiness.data.ready ? 'pass' : 'warn', `ready=${exportReadiness.data.ready}; critical=${exportReadiness.data.totalCritical}; reviewApproved=${exportReadiness.data.reviewApproved}`);

const exportResult = await request('/api/export', {
  method: 'POST',
  cookie,
  body: JSON.stringify({
    fiscalYearId,
    format: 'excel',
    selected: ['statements', 'notes', 'expense_details', 'fiscal_forms', 'validation', 'traceability'],
    includeTraceability: true,
  }),
});
if (exportResult.response.ok) {
  log('Export Excel', 'pass', `${exportResult.response.headers.get('x-export-file-name')}; bytes=${exportResult.data.length}`);
} else {
  log('Export Excel', 'warn', `${exportResult.response.status}: ${JSON.stringify(exportResult.data)}`);
}

const failed = steps.filter((step) => step.status === 'fail');
if (failed.length > 0) process.exitCode = 1;
