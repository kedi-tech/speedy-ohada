import argparse
import json
import posixpath
import re
import zipfile
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}

SHEET_REF_RE = re.compile(r"(?:'([^']+)'|((?:\[[^\]]+\])?[A-Za-z0-9_][A-Za-z0-9_ .-]*))!")
CELL_REF_RE = re.compile(r"\$?[A-Z]{1,3}\$?\d+")

APP_CROSSWALK = [
    {
        "patterns": ["BALANCE N", "BALANCE N-1"],
        "module": "ImportEngine, BalanceNormalizer, TrialBalance import routes",
        "status": "partial",
        "next_batch": "Batch 9",
    },
    {
        "patterns": ["BALANCE REGROUPE"],
        "module": "GroupedBalanceEngine",
        "status": "partial",
        "next_batch": "Batch 9",
    },
    {
        "patterns": ["CLASSE 1", "CLASSE 2", "CLASSE 3", "CLASSE 4", "CLASSE 5", "CLASSE 6", "CLASSE 7", "CLASSE 8"],
        "module": "OHADAClassEngine, AccountPrefixEngine",
        "status": "missing_depth",
        "next_batch": "Batch 9",
    },
    {
        "patterns": ["ACTIF"],
        "module": "ActifEngine",
        "status": "partial",
        "next_batch": "Batch 11",
    },
    {
        "patterns": ["PASSIF"],
        "module": "PassifEngine",
        "status": "partial",
        "next_batch": "Batch 11",
    },
    {
        "patterns": ["BILAN"],
        "module": "FinancialStatementEngine",
        "status": "partial",
        "next_batch": "Batch 11",
    },
    {
        "patterns": ["COMPTE DE RESULTAT"],
        "module": "IncomeStatementEngine",
        "status": "partial",
        "next_batch": "Batch 11",
    },
    {
        "patterns": ["TABLEAU DE FLUX"],
        "module": "CashFlowEngine",
        "status": "partial",
        "next_batch": "Batch 12",
    },
    {
        "patterns": ["Feuil2", "CAPITAL"],
        "module": "CashFlowEngine, FinancialStatementEngine",
        "status": "missing_helper_logic",
        "next_batch": "Batch 12",
    },
    {
        "patterns": ["Feuil3"],
        "module": "IncomeStatementEngine, FinancialStatementEngine",
        "status": "missing_helper_logic",
        "next_batch": "Batch 11",
    },
    {
        "patterns": ["NOTES ANNEXES", "NOTE "],
        "module": "NotesAnnexesEngine",
        "status": "partial_missing_9_36",
        "next_batch": "Batch 13",
    },
    {
        "patterns": ["NOTES - MEMORANDUM", "COMPLEMENT TABLEAU 13"],
        "module": "NotesAnnexesEngine, ExpenseDetailsEngine",
        "status": "missing_helper_logic",
        "next_batch": "Batch 13",
    },
    {
        "patterns": ["DETAIL DES CHARGES"],
        "module": "ExpenseDetailsEngine",
        "status": "partial",
        "next_batch": "Batch 14",
    },
    {
        "patterns": ["CALCULS FISCAUX", "BIC", "PATENTE", "HONORAIRES", "DNI", "B V"],
        "module": "FiscalEngine",
        "status": "partial",
        "next_batch": "Batch 15",
    },
    {
        "patterns": ["REPARTIT RESULT PERSONNES", "COMPLT ENTREPR INDIVID"],
        "module": "FiscalEngine, company/report metadata UI",
        "status": "missing",
        "next_batch": "Batch 15",
    },
    {
        "patterns": ["ECARTS DE CONV"],
        "module": "MappingEngine, ActifEngine, PassifEngine, NotesAnnexesEngine",
        "status": "missing",
        "next_batch": "Batch 16",
    },
    {
        "patterns": ["controle"],
        "module": "ValidationEngine",
        "status": "partial",
        "next_batch": "Batch 17",
    },
    {
        "patterns": ["IMPRESSION", "IMPRIMER", "PAGE DE GARDE", "FICHE", "dirigeants", "SOMMAIRE", "ACCUEIL", "TITRE", "CODES ACTIVITES", "RENSEIGNEMENT"],
        "module": "ExportPreparationEngine, company/report metadata UI",
        "status": "partial_display_export",
        "next_batch": "Batch 19",
    },
]


def text_of(node):
    if node is None:
        return ""
    return "".join(node.itertext())


def resolve_target(base, target):
    if target.startswith("/"):
        return target.lstrip("/")
    return posixpath.normpath(posixpath.join(posixpath.dirname(base), target))


def load_workbook_relations(zf):
    rel_path = "xl/_rels/workbook.xml.rels"
    if rel_path not in zf.namelist():
        return {}
    root = ET.fromstring(zf.read(rel_path))
    return {
        rel.attrib["Id"]: resolve_target("xl/workbook.xml", rel.attrib.get("Target", ""))
        for rel in root.findall("pkgrel:Relationship", NS)
    }


def extract_sheet_refs(formula):
    refs = []
    for match in SHEET_REF_RE.finditer(formula or ""):
        name = match.group(1) or match.group(2) or ""
        name = name.strip()
        name = re.sub(r"^\[[^\]]+\]", "", name).strip()
        name = re.split(r"[\(\+\-\*/=,]", name)[-1].strip()
        if name and not name.isdigit() and not CELL_REF_RE.fullmatch(name):
            refs.append(name)
    return sorted(set(refs))


def classify_sheet(sheet_name):
    upper = sheet_name.upper()
    if "BALANCE" in upper or upper.startswith("CLASSE "):
        return "calculation"
    if upper in {"ACTIF", "PASSIF"} or "BILAN" in upper or "COMPTE DE RESULTAT" in upper or "TABLEAU DE FLUX" in upper:
        return "calculation"
    if upper.startswith("NOTE") or "NOTES" in upper or "DETAIL DES CHARGES" in upper:
        return "calculation"
    if "ECARTS DE CONV" in upper:
        return "calculation"
    if any(token in upper for token in ["FISC", "BIC", "PATENTE", "HONORAIRES", "DNI"]):
        return "calculation"
    if "CONTROLE" in upper:
        return "validation"
    if any(token in upper for token in ["IMPRESSION", "IMPRIMER", "PAGE DE GARDE", "FICHE", "SOMMAIRE", "ACCUEIL", "TITRE", "DIRIGEANTS", "CODES ACTIVITES"]):
        return "display_or_export"
    return "unknown"


def crosswalk_for(sheet_name):
    upper = sheet_name.upper()
    for entry in APP_CROSSWALK:
        for pattern in entry["patterns"]:
            if pattern.upper() in upper:
                return {
                    "app_module": entry["module"],
                    "implementation_status": entry["status"],
                    "next_batch": entry["next_batch"],
                }
    return {
        "app_module": "No explicit app module mapped yet",
        "implementation_status": "needs_review",
        "next_batch": "Batch 8 follow-up or relevant domain batch",
    }


def inspect_workbook(path):
    workbook = {
        "path": str(path),
        "exists": path.exists(),
        "sheets": [],
        "defined_names": [],
        "external_links": [],
        "summary": {},
    }
    if not path.exists():
        return workbook

    with zipfile.ZipFile(path) as zf:
        names = set(zf.namelist())
        workbook["has_vba"] = "xl/vbaProject.bin" in names
        workbook["external_links"] = sorted(name for name in names if name.startswith("xl/externalLinks/"))
        workbook["drawing_count"] = sum(1 for name in names if name.startswith("xl/drawings/") and name.endswith(".xml"))
        workbook["chart_count"] = sum(1 for name in names if name.startswith("xl/charts/") and name.endswith(".xml"))

        wb_root = ET.fromstring(zf.read("xl/workbook.xml"))
        rels = load_workbook_relations(zf)

        defined_names = wb_root.find("main:definedNames", NS)
        if defined_names is not None:
            for node in defined_names.findall("main:definedName", NS):
                workbook["defined_names"].append({
                    "name": node.attrib.get("name"),
                    "scope_sheet_id": node.attrib.get("localSheetId"),
                    "text": text_of(node),
                })

        sheets = wb_root.findall("main:sheets/main:sheet", NS)
        total_formulas = 0
        total_nonempty = 0
        hidden_count = 0
        category_counts = Counter()

        for sheet in sheets:
            rel_id = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            target = rels.get(rel_id, "")
            if not target.startswith("xl/"):
                target = "xl/" + target.lstrip("/")

            sheet_name = sheet.attrib.get("name", "")
            state = sheet.attrib.get("state", "visible")
            if state != "visible":
                hidden_count += 1

            sheet_info = {
                "name": sheet_name,
                "state": state,
                "sheet_id": sheet.attrib.get("sheetId"),
                "xml_path": target,
                "dimension": None,
                "nonempty_cells": 0,
                "formula_cells": 0,
                "shared_formula_cells": 0,
                "formula_samples": [],
                "referenced_sheets": [],
                "classification": classify_sheet(sheet_name),
                "crosswalk": crosswalk_for(sheet_name),
            }

            if target in names:
                root = ET.fromstring(zf.read(target))
                dimension = root.find("main:dimension", NS)
                if dimension is not None:
                    sheet_info["dimension"] = dimension.attrib.get("ref")

                refs = Counter()
                for cell in root.findall(".//main:c", NS):
                    has_value = cell.find("main:v", NS) is not None or cell.find("main:is", NS) is not None
                    formula = cell.find("main:f", NS)
                    if formula is not None:
                        has_value = True
                        sheet_info["formula_cells"] += 1
                        formula_text = text_of(formula)
                        if formula.attrib.get("t") == "shared" and not formula_text:
                            sheet_info["shared_formula_cells"] += 1
                        for ref in extract_sheet_refs(formula_text):
                            refs[ref] += 1
                        if formula_text and len(sheet_info["formula_samples"]) < 25:
                            sheet_info["formula_samples"].append({
                                "cell": cell.attrib.get("r"),
                                "formula": formula_text,
                                "referenced_sheets": extract_sheet_refs(formula_text),
                            })
                    if has_value:
                        sheet_info["nonempty_cells"] += 1

                sheet_info["referenced_sheets"] = [
                    {"sheet": name, "count": count}
                    for name, count in refs.most_common()
                ]

            total_formulas += sheet_info["formula_cells"]
            total_nonempty += sheet_info["nonempty_cells"]
            category_counts[sheet_info["classification"]] += 1
            workbook["sheets"].append(sheet_info)

        workbook["summary"] = {
            "sheet_count": len(sheets),
            "hidden_or_very_hidden_sheet_count": hidden_count,
            "defined_name_count": len(workbook["defined_names"]),
            "external_link_count": len(workbook["external_links"]),
            "total_nonempty_cells": total_nonempty,
            "total_formula_cells": total_formulas,
            "sheet_classification_counts": dict(sorted(category_counts.items())),
        }

    return workbook


def build_markdown(catalog):
    lines = [
        "# Excel Formula Crosswalk",
        "",
        "Generated from the two source macro workbooks. This file is used by batch 8 and later batches to keep the app aligned with the workbook logic.",
        "",
        "## Workbook Summary",
        "",
        "| Workbook | Sheets | Hidden | Formula cells | Defined names | External links |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
    ]

    for workbook in catalog["workbooks"]:
        summary = workbook["summary"]
        lines.append(
            f"| `{Path(workbook['path']).name}` | {summary.get('sheet_count', 0)} | "
            f"{summary.get('hidden_or_very_hidden_sheet_count', 0)} | "
            f"{summary.get('total_formula_cells', 0)} | "
            f"{summary.get('defined_name_count', 0)} | "
            f"{summary.get('external_link_count', 0)} |"
        )

    lines.extend([
        "",
        "## Sheet Crosswalk",
        "",
        "| Workbook | Sheet | State | Dimension | Formulas | Classification | App module | Status | Batch |",
        "| --- | --- | --- | --- | ---: | --- | --- | --- | --- |",
    ])

    for workbook in catalog["workbooks"]:
        workbook_name = Path(workbook["path"]).name
        for sheet in workbook["sheets"]:
            crosswalk = sheet["crosswalk"]
            lines.append(
                f"| `{workbook_name}` | `{sheet['name']}` | {sheet['state']} | "
                f"{sheet.get('dimension') or ''} | {sheet['formula_cells']} | "
                f"{sheet['classification']} | {crosswalk['app_module']} | "
                f"{crosswalk['implementation_status']} | {crosswalk['next_batch']} |"
            )

    lines.extend([
        "",
        "## High Formula Density Sheets",
        "",
        "| Workbook | Sheet | Formulas | Referenced sheets | Implementation target |",
        "| --- | --- | ---: | --- | --- |",
    ])

    dense = []
    for workbook in catalog["workbooks"]:
        workbook_name = Path(workbook["path"]).name
        for sheet in workbook["sheets"]:
            if sheet["formula_cells"] >= 100:
                refs = ", ".join(ref["sheet"] for ref in sheet["referenced_sheets"][:6])
                dense.append((sheet["formula_cells"], workbook_name, sheet["name"], refs, sheet["crosswalk"]["next_batch"]))
    for formula_count, workbook_name, sheet_name, refs, batch in sorted(dense, reverse=True):
        lines.append(f"| `{workbook_name}` | `{sheet_name}` | {formula_count} | {refs} | {batch} |")

    lines.extend([
        "",
        "## Coverage Notes",
        "",
        "- Sheets marked `partial` already have an app engine or UI area, but the implementation does not yet match workbook depth.",
        "- Sheets marked `missing_depth` need workbook-equivalent calculation modules or much deeper rule coverage.",
        "- Sheets marked `missing` have no complete equivalent in the app yet.",
        "- Sheets marked `display_or_export` may include metadata, print layout, or export template logic rather than accounting calculations.",
        "- `formula-catalog.json` contains formula samples and cross-sheet references for implementation work.",
        "",
    ])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("workbooks", nargs="+")
    parser.add_argument("--json-out", default="implementation/formula-catalog.json")
    parser.add_argument("--md-out", default="implementation/formula-crosswalk.md")
    args = parser.parse_args()

    catalog = {
        "generated_by": "scripts/extract-formula-catalog.py",
        "workbooks": [inspect_workbook(Path(path)) for path in args.workbooks],
    }

    json_out = Path(args.json_out)
    md_out = Path(args.md_out)
    json_out.parent.mkdir(parents=True, exist_ok=True)
    md_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.write_text(json.dumps(catalog, ensure_ascii=True, indent=2), encoding="utf-8")
    md_out.write_text(build_markdown(catalog), encoding="utf-8")

    print(json.dumps({
        "json_out": str(json_out),
        "md_out": str(md_out),
        "workbook_count": len(catalog["workbooks"]),
        "total_formula_cells": sum(w["summary"].get("total_formula_cells", 0) for w in catalog["workbooks"]),
    }, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
