import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDir = path.join(root, 'tests', 'fixtures', 'imports');
const tolerance = 1;
const checks = [];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function json(relativePath) {
  return JSON.parse(read(relativePath));
}

function check(name, pass, details = '') {
  checks.push({ name, pass: Boolean(pass), details });
}

function num(value) {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeLine(line) {
  const openingDebit = num(line.opening_debit);
  const openingCredit = num(line.opening_credit);
  const movementDebit = num(line.movement_debit);
  const movementCredit = num(line.movement_credit);
  let closingDebit = num(line.closing_debit);
  let closingCredit = num(line.closing_credit);
  let netBalance;

  if (line.net_balance !== undefined && line.net_balance !== null) {
    netBalance = num(line.net_balance);
    closingDebit = netBalance > 0 ? netBalance : 0;
    closingCredit = netBalance < 0 ? Math.abs(netBalance) : 0;
  } else if ((line.closing_debit !== undefined && line.closing_debit !== null) || (line.closing_credit !== undefined && line.closing_credit !== null)) {
    netBalance = closingDebit - closingCredit;
  } else {
    netBalance = openingDebit + movementDebit - openingCredit - movementCredit;
    closingDebit = netBalance > 0 ? netBalance : 0;
    closingCredit = netBalance < 0 ? Math.abs(netBalance) : 0;
  }

  return {
    accountNumber: String(line.account_number ?? '').trim().replace(/\s+/g, ''),
    accountLabel: String(line.account_label ?? '').trim(),
    openingDebit,
    openingCredit,
    movementDebit,
    movementCredit,
    closingDebit: Math.abs(closingDebit),
    closingCredit: Math.abs(closingCredit),
    netBalance,
  };
}

function summarize(lines) {
  const normalized = lines.map(normalizeLine);
  const totalDebit = normalized.reduce((sum, line) => sum + line.closingDebit, 0);
  const totalCredit = normalized.reduce((sum, line) => sum + line.closingCredit, 0);
  return {
    totalDebit,
    totalCredit,
    difference: totalDebit - totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) <= tolerance,
    normalized,
  };
}

function classTotals(normalized) {
  return normalized.reduce((acc, line) => {
    const accountClass = line.accountNumber.slice(0, 1);
    acc[accountClass] = (acc[accountClass] ?? 0) + line.netBalance;
    return acc;
  }, {});
}

function closeEnough(actual, expected) {
  return Math.abs(actual - expected) <= tolerance;
}

function assertSummary(fixtureName, label, actual, expected) {
  check(`${fixtureName} ${label} total debit`, closeEnough(actual.totalDebit, expected.totalDebit), `${actual.totalDebit} !== ${expected.totalDebit}`);
  check(`${fixtureName} ${label} total credit`, closeEnough(actual.totalCredit, expected.totalCredit), `${actual.totalCredit} !== ${expected.totalCredit}`);
  check(`${fixtureName} ${label} difference`, closeEnough(actual.difference, expected.difference), `${actual.difference} !== ${expected.difference}`);
  check(`${fixtureName} ${label} balanced within tolerance`, actual.isBalanced);
}

function assertClassTotals(fixtureName, label, actual, expected) {
  for (const [accountClass, amount] of Object.entries(expected ?? {})) {
    check(`${fixtureName} ${label} class ${accountClass}`, closeEnough(actual[accountClass] ?? 0, amount), `${actual[accountClass] ?? 0} !== ${amount}`);
  }
}

const fixtureFiles = readdirSync(fixtureDir).filter((name) => name.endsWith('.json')).sort();
check('fixture set contains four import variants', fixtureFiles.length === 4, fixtureFiles.join(', '));
for (const file of fixtureFiles) {
  const fixture = json(path.join('tests', 'fixtures', 'imports', file));
  check(`${fixture.name} has N import lines`, Array.isArray(fixture.rawLinesN) && fixture.rawLinesN.length > 0);

  const n = summarize(fixture.rawLinesN);
  assertSummary(fixture.name, 'N', n, fixture.expected.n);
  assertClassTotals(fixture.name, 'N', classTotals(n.normalized), fixture.expected.classTotalsN);

  if (fixture.rawLinesN1) {
    const n1 = summarize(fixture.rawLinesN1);
    assertSummary(fixture.name, 'N-1', n1, fixture.expected.n1);
    assertClassTotals(fixture.name, 'N-1', classTotals(n1.normalized), fixture.expected.classTotalsN1);
  }

  if (fixture.expected.missingOptionalNumericDefaults) {
    check(`${fixture.name} optional numeric fields default to zero`, n.normalized.every((line) => line.openingDebit === 0 && line.movementDebit === 0));
  }
  if (fixture.expected.derivedFromNetBalance) {
    check(`${fixture.name} derives debit/credit from net_balance`, n.normalized.some((line) => line.closingDebit > 0) && n.normalized.some((line) => line.closingCredit > 0));
  }
}

const sourceChecks = [
  ['grouped balance workbook rows exist', 'lib/engine/GroupedBalanceEngine.ts', ['buildWorkbookStyleGroupedBalance', 'prefix_level', 'source_accounts']],
  ['OHADA class module aggregates balances', 'lib/engine/OHADAClassEngine.ts', ['buildOHADAClassSummaries', 'summarizeClass', 'opening_debit', 'closing_credit']],
  ['financial statements consume grouped balances', 'lib/engine/FinancialStatementEngine.ts', ['groupedBalanceN', 'calculateActif', 'calculatePassif', 'calculateIncomeStatement']],
  ['notes are generated from statement lines', 'lib/engine/NotesAnnexesEngine.ts', ['NoteAnnexe', 'required_when', 'manual_fields']],
  ['expense details reconcile class 6', 'lib/engine/ExpenseDetailsEngine.ts', ['class6_total_N', 'income_statement_expense_total_N', 'fiscal_review_total_N']],
  ['fiscal schedules include DGI forms', 'lib/engine/FiscalEngine.ts', ['bic_pages', 'dni_lines', 'bv_schedule', 'patente_lines', 'honoraire_lines']],
  ['validation covers materiality and exports', 'lib/engine/ValidationEngine.ts', ['validateMateriality', 'validateExpenseDetails', 'validateFiscal', 'can_export']],
  ['exports render workbook PDF and ZIP', 'lib/server-export-renderers.ts', ['buildExportWorkbookBuffer', 'buildExportPdfBuffer', 'buildZipBuffer', 'Fiscal DGI']],
  ['export API reruns before export and downloads files', 'app/api/export/route.ts', ['pre_export_validation', 'Content-Disposition', 'selectedDocuments', 'exportSignature']],
];

for (const [name, relativePath, needles] of sourceChecks) {
  const content = read(relativePath);
  check(name, needles.every((needle) => content.includes(needle)), `${relativePath} missing ${needles.filter((needle) => !content.includes(needle)).join(', ')}`);
}

const importRoute = read('app/api/trial-balance/import/route.ts');
check('import route normalizes sparse raw lines', importRoute.includes('normalizeBalance(rawLines') && importRoute.includes('rebuildGroupedBalanceRows'));

const validationCenter = read('components/screens/ValidationCenter.tsx');
check('validation fix action reruns formula-capable calculations', validationCenter.includes('validation_formula_fix') && validationCenter.includes('canAutoFixFormula'));
check('validation fix action routes missing imported data', validationCenter.includes("validation.fixType === 'import'") && validationCenter.includes("router.push(fixRoute(validation))"));

const reviewWorkflow = read('components/screens/ReviewWorkflow.tsx');
check('review workflow supports approve all before export', reviewWorkflow.includes('approveReview()') && reviewWorkflow.includes("router.push('/export')"));
check('review workflow supports locking approved report', reviewWorkflow.includes("action: 'lock'") && reviewWorkflow.includes('showLockDialog'));

const exportCenter = read('components/screens/ExportCenter.tsx');
check('export center downloads generated blob', exportCenter.includes('URL.createObjectURL') && exportCenter.includes('X-Export-File-Name') && exportCenter.includes('anchor.download'));

function materialityThreshold({ totalAssets, turnover, netResult }, config) {
  return Math.max(
    config.fixed_threshold ?? 0,
    Math.abs(totalAssets) * ((config.assets_percentage ?? 1) / 100),
    Math.abs(turnover) * ((config.turnover_percentage ?? 0.5) / 100),
    Math.abs(netResult) * ((config.net_result_percentage ?? 5) / 100),
  );
}

check('numeric tolerance accepts rounding noise', Math.abs(1000000.4 - 1000000) <= tolerance);
check('numeric tolerance rejects material difference', Math.abs(1000002.5 - 1000000) > tolerance);
check('materiality uses largest configured basis', materialityThreshold(
  { totalAssets: 1000000, turnover: 3000000, netResult: 100000 },
  { fixed_threshold: 5000, assets_percentage: 1, turnover_percentage: 0.5, net_result_percentage: 5 },
) === 15000);

const failed = checks.filter((item) => !item.pass);
for (const item of checks) {
  console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.name}${item.pass || !item.details ? '' : ` (${item.details})`}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} workbook parity regression check(s) failed.`);
  process.exitCode = 1;
}
