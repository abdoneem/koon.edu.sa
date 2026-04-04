"""Emit docs/requirements.docx (minimal OOXML). Run: python scripts/build-requirements-docx.py"""
from __future__ import annotations

import xml.sax.saxutils as xu
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "requirements.docx"

CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>"""

RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

DOC_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>"""

BODY = """KOON School Website — Official Requirements

This file is the repository copy of requirements.docx.

Replace the body of this document with your authoritative Word version (board/client). The site implementation is driven by src/i18n/siteDocument.ts and homepage bundles; keep this file as the formal reference when available.

Suggested sections for alignment:
• Why Koon — five institutional core values
• Academic programs — KG–12 continuum, bilingual model, pathways
• Media center — news, gallery, social channels
• School identity — vision, mission, philosophy

See also: docs/website-redesign-audit.md, docs/website-redesign-strategy.md."""


def build_document_xml() -> str:
    parts: list[str] = []
    for block in BODY.strip().split("\n\n"):
        for line in block.split("\n"):
            parts.append(
                f'<w:p><w:r><w:t xml:space="preserve">{xu.escape(line)}</w:t></w:r></w:p>'
            )
        parts.append("<w:p/>")
    inner = "".join(parts)
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {inner}
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>"""


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc_xml = build_document_xml()
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CONTENT_TYPES)
        z.writestr("_rels/.rels", RELS)
        z.writestr("word/_rels/document.xml.rels", DOC_RELS)
        z.writestr("word/document.xml", doc_xml)
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
