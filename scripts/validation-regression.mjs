import { readFileSync } from 'node:fs';

const validationCenter = readFileSync(new URL('../components/screens/ValidationCenter.tsx', import.meta.url), 'utf8');
const validationEngine = readFileSync(new URL('../lib/engine/ValidationEngine.ts', import.meta.url), 'utf8');

const checks = [
  {
    name: 'materiality uses assets, turnover, and net result',
    pass: validationEngine.includes('turnover_percentage') && validationEngine.includes('net_result_percentage') && validationEngine.includes('totalAssets'),
  },
  {
    name: 'validation center maps expense details',
    pass: validationCenter.includes("expense_details: 'fs'"),
  },
  {
    name: 'validation center maps conversion differences',
    pass: validationCenter.includes("conversion_differences: 'fs'"),
  },
  {
    name: 'fix action can recalculate conversion differences',
    pass: validationCenter.includes("code.startsWith('CONV_')"),
  },
  {
    name: 'fix action can recalculate fiscal reconciliation',
    pass: validationCenter.includes("code.startsWith('FISCAL_TAX_RECONCILIATION_')"),
  },
  {
    name: 'manual fix messaging distinguishes imported data',
    pass: validationCenter.includes("validation.fixType === 'import'"),
  },
];

const failed = checks.filter((check) => !check.pass);
for (const check of checks) {
  console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
