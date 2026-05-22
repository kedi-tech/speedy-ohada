import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def text_of(node):
    if node is None:
        return None
    return "".join(node.itertext())


def col_to_idx(ref):
    col = re.sub(r"[^A-Z]", "", ref.upper())
    idx = 0
    for ch in col:
        idx = idx * 26 + ord(ch) - 64
    return idx


def load_shared_strings(zf):
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    return [text_of(si) or "" for si in root.findall("main:si", NS)]


def cell_value(cell, shared):
    formula = cell.find("main:f", NS)
    value = cell.find("main:v", NS)
    inline = cell.find("main:is", NS)
    if formula is not None:
        return "=" + (text_of(formula) or "")
    if inline is not None:
        return text_of(inline)
    if value is None:
        return None
    raw = value.text
    if cell.attrib.get("t") == "s":
        try:
            return shared[int(raw)]
        except Exception:
            return raw
    return raw


def inspect(path):
    result = {"path": str(path), "exists": path.exists()}
    if not path.exists():
        return result

    with zipfile.ZipFile(path) as zf:
        names = set(zf.namelist())
        result["has_vba"] = "xl/vbaProject.bin" in names
        result["has_external_links"] = any(name.startswith("xl/externalLinks/") for name in names)
        result["drawing_count"] = sum(1 for name in names if name.startswith("xl/drawings/") and name.endswith(".xml"))
        result["chart_count"] = sum(1 for name in names if name.startswith("xl/charts/") and name.endswith(".xml"))
        shared = load_shared_strings(zf)

        wb_root = ET.fromstring(zf.read("xl/workbook.xml"))
        rel_root = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
        rels = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in rel_root.findall("pkgrel:Relationship", NS)
        }

        defined = []
        dn_root = wb_root.find("main:definedNames", NS)
        if dn_root is not None:
            for node in dn_root.findall("main:definedName", NS):
                defined.append({"name": node.attrib.get("name"), "text": text_of(node)})
        result["defined_names"] = defined[:50]
        result["defined_names_count"] = len(defined)

        sheets = []
        for sheet in wb_root.findall("main:sheets/main:sheet", NS):
            rel_id = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            target = rels.get(rel_id, "")
            xml_path = "xl/" + target.lstrip("/")
            if xml_path not in names:
                xml_path = "xl/worksheets/" + Path(target).name
            info = {
                "name": sheet.attrib.get("name"),
                "state": sheet.attrib.get("state", "visible"),
                "sheet_id": sheet.attrib.get("sheetId"),
                "xml_path": xml_path,
            }
            if xml_path in names:
                root = ET.fromstring(zf.read(xml_path))
                dim = root.find("main:dimension", NS)
                info["dimension"] = dim.attrib.get("ref") if dim is not None else None
                rows = root.findall("main:sheetData/main:row", NS)
                info["row_count_xml"] = len(rows)
                nonempty = 0
                formulas = 0
                sample = []
                for row in rows:
                    row_items = []
                    for cell in row.findall("main:c", NS):
                        nonempty += 1
                        if cell.find("main:f", NS) is not None:
                            formulas += 1
                        ref = cell.attrib.get("r", "")
                        if len(sample) < 8 and col_to_idx(ref) <= 8:
                            row_items.append((col_to_idx(ref), cell_value(cell, shared)))
                    if len(sample) < 8 and row_items:
                        max_col = min(8, max(idx for idx, _ in row_items))
                        vals = [None] * max_col
                        for idx, val in row_items:
                            vals[idx - 1] = val
                        sample.append(vals)
                info["nonempty_cells_xml"] = nonempty
                info["formula_cells_xml"] = formulas
                info["sample_top_left"] = sample
            sheets.append(info)
        result["sheet_count"] = len(sheets)
        result["sheets"] = sheets
    return result


paths = [Path(p) for p in sys.argv[1:]]
print(json.dumps([inspect(p) for p in paths], ensure_ascii=True, indent=2))
