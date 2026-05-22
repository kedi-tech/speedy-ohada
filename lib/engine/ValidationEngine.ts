import type {
  ValidationMessage,
  ValidationResult,
  FullValidationReport,
  NormalizedAccount,
  ReportLine,
  MaterialityConfig,
} from './types';
import type { BalanceSummary } from './BalanceNormalizer';
import type { ActifReport } from './ActifEngine';
import type { PassifReport } from './PassifEngine';
import type { IncomeStatementReport } from './IncomeStatementEngine';
import type { CashFlowReport } from './CashFlowEngine';
import type { ExpenseDetailsReport } from './ExpenseDetailsEngine';
import type { ConversionDifferencesReport } from './ConversionDifferencesEngine';
import type { NoteAnnexe } from './NotesAnnexesEngine';
import type { FiscalResult } from './types';
import type { TaxConfig } from './types';

function msg(
  code: string,
  category: string,
  severity: ValidationMessage['severity'],
  fr: string,
  en: string,
  details?: string,
  fix_type?: ValidationMessage['fix_type'],
  fix_target?: string,
): ValidationMessage {
  return { code, category, severity, message_fr: fr, message_en: en, details, fix_type, fix_target };
}

function makeResult(category: string, messages: ValidationMessage[]): ValidationResult {
  return {
    category,
    passed: !messages.some((m) => m.severity === 'critical'),
    messages,
    critical_count: messages.filter((m) => m.severity === 'critical').length,
    warning_count:  messages.filter((m) => m.severity === 'warning').length,
    info_count:     messages.filter((m) => m.severity === 'info').length,
    passed_count:   messages.filter((m) => m.severity === 'passed').length,
  };
}

// ─── Category validators ──────────────────────────────────────────────────────

function validateCompanyInfo(companyInfo: Record<string, string | undefined>): ValidationResult {
  const messages: ValidationMessage[] = [];
  const required: Array<[string, string, string]> = [
    ['name',         'Raison sociale',          'Company name'],
    ['currency',     'Monnaie',                 'Currency'],
    ['opening_date', 'Date d\'ouverture',        'Opening date'],
    ['closing_date', 'Date de clôture',          'Closing date'],
  ];
  for (const [key, labelFr, labelEn] of required.filter(([key]) => key === 'name' || key === 'currency')) {
    if (!companyInfo[key]) {
      messages.push(msg(`COMPANY_${key.toUpperCase()}_MISSING`, 'company', 'critical',
        `${labelFr} est requis.`, `${labelEn} is required.`));
    } else {
      messages.push(msg(`COMPANY_${key.toUpperCase()}_OK`, 'company', 'passed',
        `${labelFr} renseigné.`, `${labelEn} provided.`));
    }
  }
  return makeResult('company', messages);
}

function validateBalanceN(
  accountsN: NormalizedAccount[],
  summary: BalanceSummary,
  tolerance: number,
): ValidationResult {
  const messages: ValidationMessage[] = [];

  if (accountsN.length === 0) {
    messages.push(msg('BAL_N_EMPTY', 'balance_n', 'critical',
      'La balance N est vide.', 'Balance N is empty.'));
    return makeResult('balance_n', messages);
  }
  messages.push(msg('BAL_N_EXISTS', 'balance_n', 'passed',
    'La balance N est importée.', 'Balance N is imported.'));

  if (summary.is_balanced) {
    messages.push(msg('BAL_N_BALANCED', 'balance_n', 'passed',
      'La balance N est équilibrée.', 'Balance N is balanced.'));
  } else {
    messages.push(msg('BAL_N_UNBALANCED', 'balance_n', 'critical',
      `La balance N n'est pas équilibrée. Écart : ${summary.difference.toFixed(2)}.`,
      `Balance N is not balanced. Difference: ${summary.difference.toFixed(2)}.`));
  }

  const withWarnings = accountsN.filter((a) => a.warnings.length > 0);
  if (withWarnings.length > 0) {
    messages.push(msg('BAL_N_WARNINGS', 'balance_n', 'warning',
      `${withWarnings.length} compte(s) présentent des avertissements.`,
      `${withWarnings.length} account(s) have warnings.`));
  }

  return makeResult('balance_n', messages);
}

function validateBalanceN1(accountsN1: NormalizedAccount[] | undefined, skipped: boolean): ValidationResult {
  const messages: ValidationMessage[] = [];
  if (!accountsN1 || accountsN1.length === 0) {
    if (skipped) {
      messages.push(msg('BAL_N1_SKIPPED', 'balance_n1', 'warning',
        'La balance N-1 a été ignorée par l\'utilisateur.',
        'Balance N-1 was explicitly skipped by the user.'));
    } else {
      messages.push(msg('BAL_N1_MISSING', 'balance_n1', 'warning',
        'La balance N-1 est absente. Les variations ne seront pas calculées.',
        'Balance N-1 is missing. Variations will not be calculated.'));
    }
  } else {
    messages.push(msg('BAL_N1_EXISTS', 'balance_n1', 'passed',
      'La balance N-1 est importée.', 'Balance N-1 is imported.'));
  }
  return makeResult('balance_n1', messages);
}

function getMateriality(totals: { totalAssets: number; turnover: number; netResult: number }, materialityConfig?: MaterialityConfig) {
  const thresholds = [
    { basis: 'fixed', value: materialityConfig?.fixed_threshold ?? 0 },
    { basis: 'assets', value: Math.abs(totals.totalAssets) * ((materialityConfig?.assets_percentage ?? 1) / 100) },
    { basis: 'turnover', value: Math.abs(totals.turnover) * ((materialityConfig?.turnover_percentage ?? 0.5) / 100) },
    { basis: 'net_result', value: Math.abs(totals.netResult) * ((materialityConfig?.net_result_percentage ?? 5) / 100) },
  ].filter((threshold) => Number.isFinite(threshold.value) && threshold.value > 0);
  return thresholds.reduce(
    (selected, threshold) => threshold.value > selected.value ? threshold : selected,
    { basis: 'default', value: 1 },
  );
}

function validateMateriality(totals: { totalAssets: number; turnover: number; netResult: number }, materialityConfig?: MaterialityConfig): ValidationResult {
  const messages: ValidationMessage[] = [];
  const threshold = getMateriality(totals, materialityConfig);

  if (!materialityConfig) {
    messages.push(msg('MATERIALITY_DEFAULT', 'materiality', 'info',
      `Aucun seuil de materialite specifique n'est configure. Seuil par defaut: ${threshold.value.toFixed(0)}.`,
      `No specific materiality threshold is configured. Default threshold: ${threshold.value.toFixed(0)}.`,
      `basis=${threshold.basis}`,
      'manual_input',
      '/settings'));
  } else {
    messages.push(msg('MATERIALITY_OK', 'materiality', 'passed',
      `Seuil de materialite applique: ${threshold.value.toFixed(0)} (${threshold.basis}).`,
      `Materiality threshold applied: ${threshold.value.toFixed(0)} (${threshold.basis}).`,
      `basis=${threshold.basis}`));
  }

  return makeResult('materiality', messages);
}

function validateAccountMapping(accountsN: NormalizedAccount[], totals: { totalAssets: number; turnover: number; netResult: number }, materialityConfig?: MaterialityConfig): ValidationResult {
  const messages: ValidationMessage[] = [];
  const unmapped = accountsN.filter((a) => a.account_class === undefined || (a.account_class < 1 || a.account_class > 8));
  const materiality = getMateriality(totals, materialityConfig).value;

  for (const acc of unmapped) {
    const isMaterial = Math.abs(acc.net_balance) > materiality;
    messages.push(msg(`UNMAP_${acc.account_number}`, 'mapping', isMaterial ? 'critical' : 'warning',
      `Compte ${acc.account_number} (${acc.account_label}) non classifié. Solde: ${acc.net_balance.toFixed(0)}.`,
      `Account ${acc.account_number} (${acc.account_label}) not classified. Balance: ${acc.net_balance.toFixed(0)}.`));
  }

  if (unmapped.length === 0) {
    messages.push(msg('MAPPING_OK', 'mapping', 'passed',
      'Tous les comptes sont classifiés.', 'All accounts are classified.'));
  }
  return makeResult('mapping', messages);
}

function validateMappingCoverage(
  accountsN: NormalizedAccount[],
  reportLines: ReportLine[] | undefined,
  totals: { totalAssets: number; turnover: number; netResult: number },
  materialityConfig?: MaterialityConfig,
): ValidationResult {
  const messages: ValidationMessage[] = [];
  const materiality = getMateriality(totals, materialityConfig).value;
  const coveredAccounts = new Set(
    (reportLines ?? []).flatMap((line) => line.source_accounts.map((account) => account.account_number)),
  );
  const uncovered = accountsN.filter((account) => {
    if (Math.abs(account.net_balance) <= 0) return false;
    if (account.account_class === 8) return false;
    return !coveredAccounts.has(account.account_number);
  });

  for (const account of uncovered) {
    const isMaterial = Math.abs(account.net_balance) > materiality;
    messages.push(msg(`COVERAGE_${account.account_number}`, 'mapping_coverage', isMaterial ? 'critical' : 'warning',
      `Compte ${account.account_number} non rattache a une ligne d'etat financier. Solde: ${account.net_balance.toFixed(0)}.`,
      `Account ${account.account_number} is not tied to a financial statement line. Balance: ${account.net_balance.toFixed(0)}.`));
  }

  if (uncovered.length === 0) {
    messages.push(msg('MAPPING_COVERAGE_OK', 'mapping_coverage', 'passed',
      'Tous les comptes significatifs alimentent une ligne traçable.',
      'All significant accounts feed a traceable line.'));
  }

  return makeResult('mapping_coverage', messages);
}

function validateStatementLines(
  category: string,
  lines: ReportLine[],
  labelFr: string,
  labelEn: string,
): ValidationResult {
  const messages: ValidationMessage[] = [];
  const requiredLines = lines.filter((line) => !line.is_header && !line.is_subtotal);
  const emptyLines = requiredLines.filter((line) => (line.value_N ?? 0) === 0 && line.source_accounts.length === 0 && !line.formula_used);

  if (requiredLines.length === 0) {
    messages.push(msg(`${category.toUpperCase()}_NO_LINES`, category, 'critical',
      `${labelFr} ne contient aucune ligne calculable.`,
      `${labelEn} has no calculable lines.`));
  } else {
    messages.push(msg(`${category.toUpperCase()}_LINES_OK`, category, 'passed',
      `${labelFr}: ${requiredLines.length} ligne(s) calculee(s).`,
      `${labelEn}: ${requiredLines.length} calculated line(s).`));
  }

  if (emptyLines.length > 0) {
    messages.push(msg(`${category.toUpperCase()}_EMPTY_LINES`, category, 'info',
      `${emptyLines.length} ligne(s) sans source ni formule dans ${labelFr}.`,
      `${emptyLines.length} line(s) have no source or formula in ${labelEn}.`));
  }

  return makeResult(category, messages);
}

function validateBilan(actif: ActifReport, passif: PassifReport, tolerance: number): ValidationResult {
  const messages: ValidationMessage[] = [];
  const diffN = actif.total_actif_N - passif.total_passif_N;

  if (Math.abs(diffN) <= tolerance) {
    messages.push(msg('BILAN_N_OK', 'bilan', 'passed',
      `Bilan N équilibré. Actif = Passif = ${actif.total_actif_N.toFixed(0)}.`,
      `Balance sheet N is balanced. Assets = Liabilities = ${actif.total_actif_N.toFixed(0)}.`));
  } else {
    messages.push(msg('BILAN_N_DIFF', 'bilan', 'critical',
      `Le total Actif est différent du total Passif. Écart N : ${diffN.toFixed(2)}.`,
      `Total assets do not equal total liabilities. Difference N: ${diffN.toFixed(2)}.`));
  }

  if (actif.total_actif_N1 !== null && passif.total_passif_N1 !== null) {
    const diffN1 = actif.total_actif_N1 - passif.total_passif_N1;
    if (Math.abs(diffN1) <= tolerance) {
      messages.push(msg('BILAN_N1_OK', 'bilan', 'passed',
        `Bilan N-1 équilibré.`, `Balance sheet N-1 is balanced.`));
    } else {
      messages.push(msg('BILAN_N1_DIFF', 'bilan', 'warning',
        `Écart bilan N-1 : ${diffN1.toFixed(2)}.`, `Balance sheet N-1 difference: ${diffN1.toFixed(2)}.`));
    }
  }

  return makeResult('bilan', messages);
}

function validateResult(incomeStatement: IncomeStatementReport, passif: PassifReport, tolerance: number): ValidationResult {
  const messages: ValidationMessage[] = [];
  const incomeResult = incomeStatement.net_result_N;
  const bilanResult  = passif.lines.find((l) => l.line_code === 'RESULTAT_NET_BILAN')?.value_N ?? null;

  if (bilanResult === null) {
    messages.push(msg('RESULT_BILAN_MISSING', 'compte_resultat', 'warning',
      'Le résultat net ne figure pas au passif.', 'Net result is not shown in liabilities.'));
  } else {
    const diff = Math.abs(incomeResult - bilanResult);
    if (diff <= tolerance) {
      messages.push(msg('RESULT_OK', 'compte_resultat', 'passed',
        `Résultat net cohérent entre CR et passif (${incomeResult.toFixed(0)}).`,
        `Net result matches between income statement and balance sheet (${incomeResult.toFixed(0)}).`));
    } else {
      messages.push(msg('RESULT_DIFF', 'compte_resultat', 'critical',
        `Le résultat du compte de résultat (${incomeResult.toFixed(0)}) ne correspond pas au résultat au passif (${bilanResult.toFixed(0)}). Écart: ${diff.toFixed(2)}.`,
        `Income statement result (${incomeResult.toFixed(0)}) does not match balance sheet result (${bilanResult.toFixed(0)}). Difference: ${diff.toFixed(2)}.`));
    }
  }
  return makeResult('compte_resultat', messages);
}

function validateCashFlow(cashFlow: CashFlowReport, tolerance: number): ValidationResult {
  const messages: ValidationMessage[] = [];
  if (!cashFlow.comparative_data_available) {
    messages.push(msg('CF_N1_MISSING', 'cash_flow', 'warning',
      'Le tableau des flux ne peut pas calculer les variations automatiques sans balance N-1.',
      'The cash flow statement cannot calculate automatic movement lines without an N-1 balance.'));
  } else if (cashFlow.is_balanced) {
    messages.push(msg('CF_OK', 'cash_flow', 'passed',
      'Le tableau des flux de trésorerie est équilibré.', 'The cash flow statement is balanced.'));
  } else {
    const diff = cashFlow.cash_flow_difference ?? 0;
    messages.push(msg('CF_DIFF', 'cash_flow', 'warning',
      `Le tableau des flux de trésorerie présente un écart de ${diff.toFixed(2)}.`,
      `The cash flow statement has a difference of ${diff.toFixed(2)}.`));
  }
  return makeResult('cash_flow', messages);
}

function validateExpenseDetails(expenseDetails: ExpenseDetailsReport, tolerance: number): ValidationResult {
  const messages: ValidationMessage[] = [];
  const diffN = Math.abs(expenseDetails.reconciliation.difference_N);

  if (diffN <= tolerance) {
    messages.push(msg('EXPENSE_DETAIL_RECONCILED', 'expense_details', 'passed',
      `Detail des charges rapproche avec le compte de resultat (${expenseDetails.total_expenses_N.toFixed(0)}).`,
      `Expense details reconcile to the income statement (${expenseDetails.total_expenses_N.toFixed(0)}).`));
  } else {
    messages.push(msg('EXPENSE_DETAIL_DIFF', 'expense_details', 'critical',
      `Detail des charges different du compte de resultat. Ecart N: ${expenseDetails.reconciliation.difference_N.toFixed(2)}.`,
      `Expense details differ from the income statement. N difference: ${expenseDetails.reconciliation.difference_N.toFixed(2)}.`));
  }

  if (expenseDetails.reconciliation.difference_N1 !== null) {
    const diffN1 = Math.abs(expenseDetails.reconciliation.difference_N1);
    if (diffN1 <= tolerance) {
      messages.push(msg('EXPENSE_DETAIL_N1_RECONCILED', 'expense_details', 'passed',
        'Detail des charges N-1 rapproche avec le compte de resultat.',
        'N-1 expense details reconcile to the income statement.'));
    } else {
      messages.push(msg('EXPENSE_DETAIL_N1_DIFF', 'expense_details', 'warning',
        `Detail des charges N-1 different du compte de resultat. Ecart: ${expenseDetails.reconciliation.difference_N1.toFixed(2)}.`,
        `N-1 expense details differ from the income statement. Difference: ${expenseDetails.reconciliation.difference_N1.toFixed(2)}.`));
    }
  }

  if (expenseDetails.non_deductible_total_N !== 0 || expenseDetails.fiscal_review_total_N !== 0) {
    messages.push(msg('EXPENSE_DETAIL_FISCAL_REVIEW', 'expense_details', 'info',
      `Charges a revoir fiscalement: ${expenseDetails.fiscal_review_total_N.toFixed(0)}; non deductibles: ${expenseDetails.non_deductible_total_N.toFixed(0)}.`,
      `Expenses flagged for tax review: ${expenseDetails.fiscal_review_total_N.toFixed(0)}; non-deductible: ${expenseDetails.non_deductible_total_N.toFixed(0)}.`));
  }

  return makeResult('expense_details', messages);
}

function validateConversionDifferences(
  conversionDifferences: ConversionDifferencesReport,
  actif: ActifReport,
  passif: PassifReport,
  notes: NoteAnnexe[],
  tolerance: number,
): ValidationResult {
  const messages: ValidationMessage[] = [];
  const actifLine = actif.lines.find((line) => line.line_code === 'ECART_CONV_ACTIF');
  const passifLine = passif.lines.find((line) => line.line_code === 'ECART_CONV_PASSIF');
  const assetDiff = conversionDifferences.asset_total_N - (actifLine?.value_N ?? 0);
  const liabilityDiff = conversionDifferences.liability_total_N - (passifLine?.value_N ?? 0);

  if (Math.abs(assetDiff) <= tolerance && Math.abs(liabilityDiff) <= tolerance) {
    messages.push(msg('CONV_RECONCILED', 'conversion_differences', 'passed',
      'Les ecarts de conversion sont rapproches avec Actif et Passif.',
      'Translation differences reconcile to Assets and Liabilities.'));
  } else {
    messages.push(msg('CONV_RECONCILIATION_DIFF', 'conversion_differences', 'critical',
      `Ecarts de conversion non rapproches. Actif: ${assetDiff.toFixed(2)}, Passif: ${liabilityDiff.toFixed(2)}.`,
      `Translation differences do not reconcile. Asset: ${assetDiff.toFixed(2)}, Liability: ${liabilityDiff.toFixed(2)}.`));
  }

  if (conversionDifferences.entries.length === 0) {
    messages.push(msg('CONV_NOT_PRESENT', 'conversion_differences', 'info',
      'Aucun compte 478/479 importe.',
      'No imported 478/479 accounts.'));
  } else {
    messages.push(msg('CONV_DETAIL_PRESENT', 'conversion_differences', 'passed',
      `${conversionDifferences.entries.length} ligne(s) d ecarts de conversion detaillees.`,
      `${conversionDifferences.entries.length} translation difference line(s) detailed.`));
  }

  const note12 = notes.find((note) => note.note_number === 12);
  if ((conversionDifferences.asset_total_N !== 0 || conversionDifferences.liability_total_N !== 0) && !note12) {
    messages.push(msg('CONV_NOTE12_MISSING', 'conversion_differences', 'warning',
      'La note 12 des ecarts de conversion est attendue.',
      'Note 12 for translation differences is expected.'));
  }

  return makeResult('conversion_differences', messages);
}

function validateNotes(notes: NoteAnnexe[]): ValidationResult {
  const messages: ValidationMessage[] = [];
  const required = notes.filter((n) => n.is_required);
  for (const note of required) {
    if (note.status === 'notStarted') {
      messages.push(msg(`NOTE_${note.note_number}_MISSING`, 'notes', 'warning',
        `Note ${note.note_number} (${note.title_fr}) est requise mais non complétée.`,
        `Note ${note.note_number} (${note.title_en}) is required but not completed.`));
    } else if (note.status === 'completed' || note.status === 'validated') {
      messages.push(msg(`NOTE_${note.note_number}_OK`, 'notes', 'passed',
        `Note ${note.note_number} complétée.`, `Note ${note.note_number} completed.`));
    }
  }
  return makeResult('notes', messages);
}

function validateFiscal(fiscal: FiscalResult, taxConfig: TaxConfig): ValidationResult {
  const messages: ValidationMessage[] = [];

  if (!taxConfig.tax_rate && taxConfig.tax_rate !== 0) {
    messages.push(msg('TAX_RATE_MISSING', 'fiscal', 'critical',
      'Le taux d\'imposition n\'est pas configuré.', 'Tax rate is not configured.'));
  } else {
    messages.push(msg('TAX_RATE_OK', 'fiscal', 'passed',
      `Taux d\'IS : ${taxConfig.tax_rate}%.`, `Corporate tax rate: ${taxConfig.tax_rate}%.`));
  }

  if (fiscal.accounting_result === null) {
    messages.push(msg('ACCOUNTING_RESULT_MISSING', 'fiscal', 'critical',
      'Le résultat comptable n\'est pas disponible.', 'Accounting result is not available.'));
  }

  if (fiscal.accounting_result !== null) {
    messages.push(msg('FISCAL_RESULT_AVAILABLE', 'fiscal', 'passed',
      `Resultat fiscal calcule: ${fiscal.taxable_result.toFixed(0)}.`,
      `Taxable result calculated: ${fiscal.taxable_result.toFixed(0)}.`));
  }

  if (Math.abs(fiscal.tax_reconciliation_difference) > taxConfig.rounding_tolerance) {
    messages.push(msg('FISCAL_TAX_RECONCILIATION_DIFF', 'fiscal', 'warning',
      `IS calcule different des comptes 69. Ecart: ${fiscal.tax_reconciliation_difference.toFixed(2)}.`,
      `Calculated CIT differs from class 69 accounts. Difference: ${fiscal.tax_reconciliation_difference.toFixed(2)}.`));
  } else {
    messages.push(msg('FISCAL_TAX_RECONCILIATION_OK', 'fiscal', 'passed',
      'IS calcule rapproche avec les comptes 69.',
      'Calculated CIT reconciles to class 69 accounts.'));
  }

  if (fiscal.deficit_generated > 0) {
    messages.push(msg('FISCAL_DEFICIT_GENERATED', 'fiscal', 'info',
      `Deficit fiscal reporte: ${fiscal.deficit_carried_forward.toFixed(0)}.`,
      `Tax loss carried forward: ${fiscal.deficit_carried_forward.toFixed(0)}.`));
  }

  return makeResult('fiscal', messages);
}

// ─── C01-C13 Statutory Controls ──────────────────────────────────────────────
// Exact identifiers and French messages from claudemaster.md Data Section 12.
// Each control produces a single message with the statutory code as its message code.

function validateStatutoryControls(input: {
  actif: ActifReport;
  passif: PassifReport;
  incomeStatement: IncomeStatementReport;
  cashFlow: CashFlowReport;
  balanceSummaryN: BalanceSummary;
  notes: NoteAnnexe[];
  tolerance: number;
  firdCompletePct?: number;
}): ValidationResult {
  const messages: ValidationMessage[] = [];
  const { actif, passif, incomeStatement, cashFlow, balanceSummaryN, notes, tolerance } = input;

  // C01 — Bilan équilibré: Actif total = Passif total
  const bilanDiff = actif.total_actif_N - passif.total_passif_N;
  if (Math.abs(bilanDiff) <= tolerance) {
    messages.push(msg('C01', 'statutory_controls', 'passed',
      'C01 — Bilan équilibré.', 'C01 — Balance sheet is balanced.'));
  } else {
    messages.push(msg('C01', 'statutory_controls', 'critical',
      `C01 — DÉSÉQUILIBRE BILAN : écart = ${bilanDiff.toFixed(0)}`,
      `C01 — BALANCE SHEET UNBALANCED: difference = ${bilanDiff.toFixed(0)}`,
      undefined, 'navigate', '/statements'));
  }

  // C02 — Résultat cohérent: XI (CR) = résultat au Passif (CJ)
  const incomeResult = incomeStatement.net_result_N;
  const bilanResult = passif.lines.find((l) => l.line_code === 'RESULTAT_NET_BILAN')?.value_N ?? null;
  if (bilanResult === null) {
    messages.push(msg('C02', 'statutory_controls', 'warning',
      'C02 — Résultat net absent au Passif (ligne CJ).', 'C02 — Net result missing from Liabilities (line CJ).'));
  } else {
    const c02Diff = Math.abs(incomeResult - bilanResult);
    if (c02Diff <= tolerance) {
      messages.push(msg('C02', 'statutory_controls', 'passed',
        'C02 — Résultat cohérent entre CR et Passif.', 'C02 — Net result consistent between income statement and balance sheet.'));
    } else {
      messages.push(msg('C02', 'statutory_controls', 'critical',
        `C02 — RÉSULTAT INCOHÉRENT : CR=${incomeResult.toFixed(0)} Bilan=${bilanResult.toFixed(0)} écart=${c02Diff.toFixed(0)}`,
        `C02 — RESULT INCONSISTENT: IS=${incomeResult.toFixed(0)} BS=${bilanResult.toFixed(0)} diff=${c02Diff.toFixed(0)}`,
        undefined, 'navigate', '/statements'));
    }
  }

  // C03 — TFT réconcilié: ZF (closing cash from TFT) = BT_N − DT_N
  const btN = actif.lines.find((l) => l.line_code === 'TOTAL_TRES_ACTIF')?.value_N ?? 0;
  const dtN = passif.lines.find((l) => l.line_code === 'TOTAL_TRES_PASSIF')?.value_N ?? 0;
  const expectedClosing = btN - dtN;
  const tfActualClosing = cashFlow.closing_cash;
  const c03Diff = Math.abs(tfActualClosing - expectedClosing);
  if (c03Diff <= tolerance) {
    messages.push(msg('C03', 'statutory_controls', 'passed',
      'C03 — TFT réconcilié avec la trésorerie du Bilan.', 'C03 — Cash flow statement reconciles to balance sheet treasury.'));
  } else {
    messages.push(msg('C03', 'statutory_controls', cashFlow.comparative_data_available ? 'critical' : 'warning',
      `C03 — TFT NON RÉCONCILIÉ : ZF=${tfActualClosing.toFixed(0)} Contrôle=${expectedClosing.toFixed(0)} écart=${c03Diff.toFixed(0)}`,
      `C03 — CASH FLOW NOT RECONCILED: ZF=${tfActualClosing.toFixed(0)} Control=${expectedClosing.toFixed(0)} diff=${c03Diff.toFixed(0)}`,
      undefined, 'navigate', '/statements'));
  }

  // C04 — Balance N équilibrée: Total Débit = Total Crédit
  if (balanceSummaryN.is_balanced) {
    messages.push(msg('C04', 'statutory_controls', 'passed',
      'C04 — Balance N équilibrée.', 'C04 — Trial balance N is balanced.'));
  } else {
    messages.push(msg('C04', 'statutory_controls', 'critical',
      `C04 — BALANCE N DÉSÉQUILIBRÉE : écart=${balanceSummaryN.difference.toFixed(0)}`,
      `C04 — TRIAL BALANCE N UNBALANCED: difference=${balanceSummaryN.difference.toFixed(0)}`,
      undefined, 'navigate', '/import'));
  }

  // C05 — Balance N-1 équilibrée (warning only — N-1 is optional)
  messages.push(msg('C05', 'statutory_controls', 'info',
    'C05 — Équilibre Balance N-1 : vérifier dans l\'écran d\'importation.',
    'C05 — Trial balance N-1 balance: verify in import screen.',
    undefined, 'navigate', '/import'));

  // C06 — Immobilisations brutes cohérentes (Note 3A total = Bilan AZ gross)
  const totalActifImmoGross = actif.lines.find((l) => l.line_code === 'TOTAL_ACTIF_IMMO')?.value_N ?? null;
  messages.push(msg('C06', 'statutory_controls', totalActifImmoGross !== null ? 'passed' : 'info',
    totalActifImmoGross !== null
      ? `C06 — Immobilisations brutes Bilan : ${totalActifImmoGross.toFixed(0)} (rapprochement Note 3A requis).`
      : 'C06 — Note 3A non encore vérifiable (notes annexes à compléter).',
    totalActifImmoGross !== null
      ? `C06 — Fixed assets gross balance sheet: ${totalActifImmoGross.toFixed(0)} (Note 3A reconciliation required).`
      : 'C06 — Note 3A not yet verifiable (annex notes to complete).',
    undefined, 'navigate', '/notes'));

  // C07 — Amortissements cohérents (Note 3C total = AZ amort column Bilan)
  messages.push(msg('C07', 'statutory_controls', 'info',
    'C07 — Rapprochement amortissements Note 3C / Bilan : à compléter dans les notes.',
    'C07 — Depreciation reconciliation Note 3C / Balance sheet: complete in annex notes.',
    undefined, 'navigate', '/notes'));

  // C08 — Provisions cohérentes (Note 28A total = DC + DN Bilan)
  messages.push(msg('C08', 'statutory_controls', 'info',
    'C08 — Rapprochement provisions Note 28A / Bilan : à compléter dans les notes.',
    'C08 — Provisions reconciliation Note 28A / Balance sheet: complete in annex notes.',
    undefined, 'navigate', '/notes'));

  // C09 — Stocks cohérents: Note 6 TOTAL NET = BB (STOCKS_NET actif)
  const stocksNet = actif.lines.find((l) => l.line_code === 'TOTAL_STOCKS_NET' || l.line_code === 'STOCKS')?.value_N ?? null;
  messages.push(msg('C09', 'statutory_controls', stocksNet !== null ? 'passed' : 'info',
    stocksNet !== null
      ? `C09 — Stocks Bilan : ${stocksNet.toFixed(0)} (rapprochement Note 6 requis).`
      : 'C09 — Note 6 non encore vérifiable.',
    stocksNet !== null
      ? `C09 — Inventory balance sheet: ${stocksNet.toFixed(0)} (Note 6 reconciliation required).`
      : 'C09 — Note 6 not yet verifiable.',
    undefined, 'navigate', '/notes'));

  // C10 — Clients cohérents: Note 7 TOTAL NET = BI (CREANCES_CLIENTS actif)
  const clientsNet = actif.lines.find((l) => l.line_code === 'CREANCES_CLIENTS')?.value_N ?? null;
  messages.push(msg('C10', 'statutory_controls', clientsNet !== null ? 'passed' : 'info',
    clientsNet !== null
      ? `C10 — Créances clients Bilan : ${clientsNet.toFixed(0)} (rapprochement Note 7 requis).`
      : 'C10 — Note 7 non encore vérifiable.',
    clientsNet !== null
      ? `C10 — Trade receivables balance sheet: ${clientsNet.toFixed(0)} (Note 7 reconciliation required).`
      : 'C10 — Note 7 not yet verifiable.',
    undefined, 'navigate', '/notes'));

  // C11 — FIRD complet: all mandatory FIRD fields filled
  const firdPct = input.firdCompletePct ?? 0;
  if (firdPct >= 100) {
    messages.push(msg('C11', 'statutory_controls', 'passed',
      'C11 — FIRD complet (100%).', 'C11 — FIRD complete (100%).'));
  } else {
    messages.push(msg('C11', 'statutory_controls', firdPct >= 50 ? 'warning' : 'critical',
      `C11 — FIRD INCOMPLET : ${firdPct}% complété. Renseignez les pages d'identification.`,
      `C11 — FIRD INCOMPLETE: ${firdPct}% complete. Fill in identification pages.`,
      undefined, 'navigate', '/'));
  }

  // C12 — Notes applicables renseignées: no note marked 'A' with status 'notStarted'
  const missingApplicableNotes = notes.filter((n) => n.is_required && n.status === 'notStarted');
  if (missingApplicableNotes.length === 0) {
    messages.push(msg('C12', 'statutory_controls', 'passed',
      'C12 — Toutes les notes applicables sont renseignées.', 'C12 — All applicable notes are completed.'));
  } else {
    const names = missingApplicableNotes.map((n) => `Note ${n.note_number}${n.note_variant}`).join(', ');
    messages.push(msg('C12', 'statutory_controls', 'warning',
      `C12 — NOTES APPLICABLES VIDES : ${names}`,
      `C12 — APPLICABLE NOTES EMPTY: ${names}`,
      undefined, 'navigate', '/notes'));
  }

  // C13 — Analyse financière cohérente: Note 34 trésorerie nette = BT_N − DT_N
  messages.push(msg('C13', 'statutory_controls', 'info',
    `C13 — Trésorerie nette Bilan : ${expectedClosing.toFixed(0)}. Vérifier cohérence Note 34.`,
    `C13 — Balance sheet net cash: ${expectedClosing.toFixed(0)}. Verify Note 34 consistency.`,
    undefined, 'navigate', '/notes'));

  return makeResult('statutory_controls', messages);
}

// ─── W01-W09 Statutory Warnings ──────────────────────────────────────────────
// Exact identifiers from claudemaster.md Data Section 13.

function validateStatutoryWarnings(input: {
  actif: ActifReport;
  passif: PassifReport;
  incomeStatement: IncomeStatementReport;
  cashFlow: CashFlowReport;
  notes: NoteAnnexe[];
  manualOverrideCount?: number;
}): ValidationResult {
  const messages: ValidationMessage[] = [];
  const { actif, passif, incomeStatement, notes } = input;

  // W01 — Capitaux propres négatifs
  const totalCP = passif.lines.find((l) => l.line_code === 'TOTAL_CP')?.value_N ?? null;
  if (totalCP !== null && totalCP < 0) {
    messages.push(msg('W01', 'statutory_warnings', 'warning',
      `W01 — Capitaux propres négatifs : ${totalCP.toFixed(0)}. Risque de continuité d'exploitation.`,
      `W01 — Negative equity: ${totalCP.toFixed(0)}. Going concern risk.`));
  } else {
    messages.push(msg('W01', 'statutory_warnings', 'passed',
      'W01 — Capitaux propres positifs.', 'W01 — Positive equity.'));
  }

  // W02 — Chiffre d'affaires nul
  const ca = incomeStatement.turnover_N;
  if (ca === 0) {
    messages.push(msg('W02', 'statutory_warnings', 'warning',
      'W02 — Chiffre d\'affaires nul (XB = 0). Vérifier les comptes 70.',
      'W02 — Zero turnover (XB = 0). Check class 70 accounts.'));
  } else {
    messages.push(msg('W02', 'statutory_warnings', 'passed',
      `W02 — Chiffre d'affaires : ${ca.toFixed(0)}.`, `W02 — Turnover: ${ca.toFixed(0)}.`));
  }

  // W03 — Changement de signe résultat vs N-1
  const netN = incomeStatement.net_result_N;
  const netN1 = incomeStatement.net_result_N1;
  if (netN1 !== null && netN1 !== 0) {
    const signChanged = (netN >= 0) !== (netN1 >= 0);
    if (signChanged) {
      messages.push(msg('W03', 'statutory_warnings', 'warning',
        `W03 — Inversion du signe du résultat : N=${netN.toFixed(0)}, N-1=${netN1.toFixed(0)}.`,
        `W03 — Result sign reversal: N=${netN.toFixed(0)}, N-1=${netN1.toFixed(0)}.`));
    } else {
      messages.push(msg('W03', 'statutory_warnings', 'passed',
        'W03 — Signe du résultat stable vs N-1.', 'W03 — Result sign stable vs N-1.'));
    }
  } else {
    messages.push(msg('W03', 'statutory_warnings', 'info',
      'W03 — Comparaison signe résultat N/N-1 non applicable (N-1 absent ou nul).',
      'W03 — N/N-1 result sign comparison not applicable (N-1 absent or zero).'));
  }

  // W04 — Soldes anormaux (accounts with abnormal balance side)
  const abnormal = actif.lines.filter((l) => (l.value_N ?? 0) < 0 && !l.is_total && !l.is_subtotal);
  if (abnormal.length > 0) {
    messages.push(msg('W04', 'statutory_warnings', 'warning',
      `W04 — ${abnormal.length} ligne(s) Actif avec solde négatif anormal. Vérifier les comptes.`,
      `W04 — ${abnormal.length} asset line(s) with abnormal negative balance. Check accounts.`));
  } else {
    messages.push(msg('W04', 'statutory_warnings', 'passed',
      'W04 — Aucun solde anormal détecté.', 'W04 — No abnormal balances detected.'));
  }

  // W05 — Données N-1 absentes sur lignes significatives
  const significantLinesWithoutN1 = incomeStatement.lines.filter((l) =>
    Math.abs(l.value_N ?? 0) > 0 && (l.value_N_1 === null || l.value_N_1 === undefined),
  );
  if (significantLinesWithoutN1.length > 0) {
    messages.push(msg('W05', 'statutory_warnings', 'warning',
      `W05 — ${significantLinesWithoutN1.length} ligne(s) sans comparatif N-1. Importez la balance N-1.`,
      `W05 — ${significantLinesWithoutN1.length} line(s) missing N-1 comparative data. Import N-1 trial balance.`,
      undefined, 'navigate', '/import'));
  } else {
    messages.push(msg('W05', 'statutory_warnings', 'passed',
      'W05 — Données N-1 présentes sur les lignes significatives.', 'W05 — N-1 comparative data present on significant lines.'));
  }

  // W06 — HAO significatif: |XH| > 20% × |XG|
  const xh = incomeStatement.hao_result_N;
  const xg = incomeStatement.lines.find((l) => l.line_code === 'RESULTAT_ACT_ORD')?.value_N ?? 0;
  if (xg !== 0 && Math.abs(xh) > 0.20 * Math.abs(xg)) {
    messages.push(msg('W06', 'statutory_warnings', 'warning',
      `W06 — HAO significatif : XH=${xh.toFixed(0)} représente ${Math.round(Math.abs(xh) / Math.abs(xg) * 100)}% de XG.`,
      `W06 — Significant non-ordinary result: XH=${xh.toFixed(0)} is ${Math.round(Math.abs(xh) / Math.abs(xg) * 100)}% of XG.`));
  } else {
    messages.push(msg('W06', 'statutory_warnings', 'passed',
      'W06 — Aucun résultat HAO significatif.', 'W06 — No significant non-ordinary result.'));
  }

  // W07 — Remplacements manuels présents
  const overrideCount = input.manualOverrideCount ?? 0;
  if (overrideCount > 0) {
    messages.push(msg('W07', 'statutory_warnings', 'warning',
      `W07 — ${overrideCount} remplacement(s) manuel(s) de mapping présent(s). Vérifier la justification.`,
      `W07 — ${overrideCount} manual mapping override(s) present. Verify justification.`));
  } else {
    messages.push(msg('W07', 'statutory_warnings', 'passed',
      'W07 — Aucun remplacement manuel actif.', 'W07 — No active manual overrides.'));
  }

  // W08 — Note 35 requise mais vide (informations sociales/environnementales)
  const note35 = notes.find((n) => n.note_number === 35);
  const note27b = notes.find((n) => n.note_number === 27 && n.note_variant === 'B');
  const hasHeadcount = note27b?.fields.some((f) => f.key === 'headcount' && Number(f.value ?? 0) >= 250);
  if (hasHeadcount && (!note35 || note35.status === 'notStarted')) {
    messages.push(msg('W08', 'statutory_warnings', 'warning',
      'W08 — Effectif ≥ 250 : Note 35 (informations sociales) requise mais vide.',
      'W08 — Headcount ≥ 250: Note 35 (social information) required but empty.',
      undefined, 'navigate', '/notes'));
  } else {
    messages.push(msg('W08', 'statutory_warnings', 'passed',
      'W08 — Note 35 non requise ou complétée.', 'W08 — Note 35 not required or completed.'));
  }

  // W09 — Lignes TFT saisies manuellement
  const manualTftCodes = ['FF', 'FG', 'FH', 'FO', 'FP', 'FQ'];
  const manualTftLines = input.cashFlow.lines.filter((l) => manualTftCodes.includes(l.line_code) && l.is_manual_override);
  if (manualTftLines.length > 0) {
    const codes = manualTftLines.map((l) => l.line_code).join(', ');
    messages.push(msg('W09', 'statutory_warnings', 'warning',
      `W09 — Lignes TFT saisies manuellement : ${codes}.`,
      `W09 — Manually entered TFT lines: ${codes}.`));
  } else {
    messages.push(msg('W09', 'statutory_warnings', 'passed',
      'W09 — Aucune ligne TFT manuelle.', 'W09 — No manually entered cash flow lines.'));
  }

  return makeResult('statutory_warnings', messages);
}

function validateReview(requiredApprovals = false, allApproved = true): ValidationResult {
  const messages: ValidationMessage[] = [];
  if (!requiredApprovals) {
    messages.push(msg('REVIEW_NOT_REQUIRED', 'review', 'info',
      "La revision formelle n'est pas requise pour ce calcul.",
      'Formal review is not required for this calculation.'));
  } else if (allApproved) {
    messages.push(msg('REVIEW_APPROVED', 'review', 'passed',
      'Toutes les approbations de revision sont obtenues.',
      'All review approvals are complete.'));
  } else {
    messages.push(msg('REVIEW_PENDING', 'review', 'critical',
      'La revision doit etre approuvee avant export final.',
      'Review must be approved before final export.'));
  }
  return makeResult('review', messages);
}

function validateExport(totalCritical: number, requiredApprovals = false, allApproved = true): ValidationResult {
  const messages: ValidationMessage[] = [];
  if (totalCritical > 0) {
    messages.push(msg('EXPORT_BLOCKED', 'export', 'critical',
      `Exportation bloquée. ${totalCritical} erreur(s) critique(s) doivent être corrigées.`,
      `Export blocked. ${totalCritical} critical error(s) must be fixed.`));
  } else {
    messages.push(msg('EXPORT_OK', 'export', 'passed',
      'Prêt pour l\'exportation.', 'Ready for export.'));
  }
  if (requiredApprovals && !allApproved) {
    messages.push(msg('EXPORT_APPROVAL_PENDING', 'export', 'critical',
      'Des approbations sont requises avant l\'exportation.',
      'Approvals are required before export.'));
  }
  return makeResult('export', messages);
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export interface ValidationInput {
  calculation_run_id: string;
  fiscal_year_id: string;
  company_id: string;
  company_info: Record<string, string | undefined>;
  accountsN: NormalizedAccount[];
  accountsN1?: NormalizedAccount[];
  balanceSummaryN: BalanceSummary;
  skipN1: boolean;
  actif: ActifReport;
  passif: PassifReport;
  incomeStatement: IncomeStatementReport;
  cashFlow: CashFlowReport;
  expenseDetails: ExpenseDetailsReport;
  conversionDifferences: ConversionDifferencesReport;
  notes: NoteAnnexe[];
  fiscal: FiscalResult;
  taxConfig: TaxConfig;
  tolerance: number;
  materialityConfig?: MaterialityConfig;
  requiredApprovals?: boolean;
  allApproved?: boolean;
  reportLines?: ReportLine[];
  /** Percentage (0-100) of mandatory FIRD fields filled — used for C11. */
  firdCompletePct?: number;
  /** Number of active manual mapping overrides — used for W07. */
  manualOverrideCount?: number;
}

export function runValidation(input: ValidationInput): FullValidationReport {
  const materialityTotals = {
    totalAssets: input.actif.total_actif_N,
    turnover: input.incomeStatement.turnover_N,
    netResult: input.incomeStatement.net_result_N,
  };
  const categories: ValidationResult[] = [
    validateCompanyInfo(input.company_info),
    validateBalanceN(input.accountsN, input.balanceSummaryN, input.tolerance),
    validateBalanceN1(input.accountsN1, input.skipN1),
    validateMateriality(materialityTotals, input.materialityConfig),
    validateAccountMapping(input.accountsN, materialityTotals, input.materialityConfig),
    validateMappingCoverage(input.accountsN, input.reportLines, materialityTotals, input.materialityConfig),
    validateBilan(input.actif, input.passif, input.tolerance),
    validateStatementLines('actif', input.actif.lines, 'Actif', 'Assets'),
    validateStatementLines('passif', input.passif.lines, 'Passif', 'Liabilities and equity'),
    validateResult(input.incomeStatement, input.passif, input.tolerance),
    validateStatementLines('compte_resultat_detail', input.incomeStatement.lines, 'Compte de resultat', 'Income statement'),
    validateCashFlow(input.cashFlow, input.tolerance),
    validateStatementLines('cash_flow_detail', input.cashFlow.lines, 'Flux de tresorerie', 'Cash flow statement'),
    validateExpenseDetails(input.expenseDetails, input.tolerance),
    validateConversionDifferences(input.conversionDifferences, input.actif, input.passif, input.notes, input.tolerance),
    validateNotes(input.notes),
    validateFiscal(input.fiscal, input.taxConfig),
    validateReview(input.requiredApprovals, input.allApproved),
    validateStatutoryControls({
      actif: input.actif,
      passif: input.passif,
      incomeStatement: input.incomeStatement,
      cashFlow: input.cashFlow,
      balanceSummaryN: input.balanceSummaryN,
      notes: input.notes,
      tolerance: input.tolerance,
      firdCompletePct: input.firdCompletePct,
    }),
    validateStatutoryWarnings({
      actif: input.actif,
      passif: input.passif,
      incomeStatement: input.incomeStatement,
      cashFlow: input.cashFlow,
      notes: input.notes,
      manualOverrideCount: input.manualOverrideCount,
    }),
  ];

  const totalCritical = categories.reduce((s, c) => s + c.critical_count, 0);
  const totalWarnings = categories.reduce((s, c) => s + c.warning_count, 0);
  const totalInfo     = categories.reduce((s, c) => s + c.info_count, 0);
  const totalPassed   = categories.reduce((s, c) => s + c.passed_count, 0);

  const exportResult  = validateExport(totalCritical, input.requiredApprovals, input.allApproved);
  categories.push(exportResult);

  const canExport = totalCritical === 0 && (!input.requiredApprovals || input.allApproved === true);
  const overallStatus: FullValidationReport['overall_status'] =
    totalCritical > 0 ? 'critical' : totalWarnings > 0 ? 'warnings' : 'valid';

  return {
    calculation_run_id: input.calculation_run_id,
    fiscal_year_id:     input.fiscal_year_id,
    company_id:         input.company_id,
    validated_at:       new Date().toISOString(),
    overall_status:     overallStatus,
    can_export:         canExport,
    categories,
    total_critical:     totalCritical,
    total_warnings:     totalWarnings,
    total_info:         totalInfo,
    total_passed:       totalPassed,
  };
}
