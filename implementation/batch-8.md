# Batch 8 - Excel Formula Catalog and Crosswalk

Status: completed

## What Was Added

- Added `scripts/extract-formula-catalog.py`.
- Generated `implementation/formula-catalog.json`.
- Generated `implementation/formula-crosswalk.md`.

## Workbook Inputs

- `D:\documents\Etats Financiers\Etats Financiers.xlsm`
- `D:\documents\Etats Financiers\SPEEDY OHADA 2.1.xlsm`

## Results

- Cataloged 2 workbooks.
- Cataloged 164 workbook sheets across both files.
- Cataloged 60,929 formula cells.
- Captured workbook-level metadata:
  - VBA presence.
  - External link files.
  - Drawing and chart counts.
  - Defined names.
  - Hidden and very hidden sheets.
- Captured sheet-level metadata:
  - Sheet name.
  - Hidden/visible state.
  - XML path.
  - Dimensions.
  - Non-empty cell counts.
  - Formula cell counts.
  - Shared formula placeholders.
  - Formula samples.
  - Cross-sheet references.
  - Calculation/display/validation classification.
  - App module crosswalk.
  - Future implementation batch.

## Crosswalk Coverage

Every inspected workbook sheet is now mapped to an app area or future batch. Important mappings include:

- `BALANCE N`, `BALANCE N-1` -> Batch 9.
- `BALANCE REGROUPE` -> Batch 9.
- `CLASSE 1` through `CLASSE 8` -> Batch 9.
- `ACTIF`, `PASSIF`, `BILAN paysage`, `COMPTE DE RESULTAT` -> Batch 11.
- `TABLEAU DE FLUX DE TRESORERIE`, `Feuil2`, `CAPITAL` -> Batch 12.
- `NOTES ANNEXES`, `NOTE 1` through `NOTE 36 TABLEAU DE CODES`, `NOTES - MEMORANDUM`, `COMPLEMENT TABLEAU 13` -> Batch 13.
- `DETAIL DES CHARGES` -> Batch 14.
- `CALCULS FISCAUX`, BIC pages, DNI, Patente, Honoraires, `B V`, individual enterprise/person result supplements -> Batch 15.
- `VENTI DES ECARTS DE CONV` -> Batch 16.
- `controle` -> Batch 17.
- Print, metadata, activity-code, cover, fiche, and company-information sheets -> Batch 19.

## Notes

The extractor reads workbook XML directly instead of using Excel automation or normal workbook loading. This is necessary because the macro workbooks contain drawing data that causes standard workbook loading to fail.

The generated JSON is intentionally detailed and should be treated as the machine-readable formula catalog for later implementation batches. The generated Markdown crosswalk is the human-readable planning view.

