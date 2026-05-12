"""
Convert REPORT.md to an academically formatted REPORT.docx.

Formatting:
- Times New Roman 12pt body, 1.15 line spacing, justified
- Headings: Times New Roman, bold, scaled by level
- Tables with light borders, alternating header shading
- Code blocks: Consolas 10pt in shaded paragraph
- Page numbers in footer (right-aligned)
- Cover page with title block and team info
"""

from __future__ import annotations

import re
from pathlib import Path

from docx import Document
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).parent
SRC = ROOT / "REPORT.md"
DST = ROOT / "REPORT.docx"

# ---------- helpers ----------

INLINE_BOLD = re.compile(r"\*\*([^*]+)\*\*")
INLINE_ITALIC = re.compile(r"(?<!\*)\*([^*\n]+)\*(?!\*)")
INLINE_CODE = re.compile(r"`([^`]+)`")
LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def _add_run(paragraph, text, *, bold=False, italic=False, code=False, font="Times New Roman", size=12):
    run = paragraph.add_run(text)
    run.font.name = font
    run.font.size = Pt(size)
    if bold:
        run.bold = True
    if italic:
        run.italic = True
    if code:
        run.font.name = "Consolas"
        run.font.size = Pt(10)
    # Ensure East Asian + ascii fonts both set
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    rFonts.set(qn("w:ascii"), "Consolas" if code else font)
    rFonts.set(qn("w:hAnsi"), "Consolas" if code else font)
    return run


def add_inline(paragraph, text):
    """Tokenize inline markdown (**bold**, *italic*, `code`, [link](url)) and add runs."""
    # Process links first by replacing with sentinels
    tokens = []
    i = 0
    while i < len(text):
        m = INLINE_BOLD.match(text, i)
        if m:
            tokens.append(("bold", m.group(1)))
            i = m.end()
            continue
        m = INLINE_CODE.match(text, i)
        if m:
            tokens.append(("code", m.group(1)))
            i = m.end()
            continue
        m = INLINE_ITALIC.match(text, i)
        if m:
            tokens.append(("italic", m.group(1)))
            i = m.end()
            continue
        m = LINK.match(text, i)
        if m:
            tokens.append(("text", m.group(1)))
            i = m.end()
            continue
        # advance one char into "text" segment until next markup char
        j = i + 1
        while j < len(text) and text[j] not in "*`[":
            j += 1
        tokens.append(("text", text[i:j]))
        i = j

    for kind, val in tokens:
        if kind == "text":
            _add_run(paragraph, val)
        elif kind == "bold":
            _add_run(paragraph, val, bold=True)
        elif kind == "italic":
            _add_run(paragraph, val, italic=True)
        elif kind == "code":
            _add_run(paragraph, val, code=True)


def set_cell_borders(cell, color="BFBFBF", size="6"):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        b = OxmlElement(f"w:{edge}")
        b.set(qn("w:val"), "single")
        b.set(qn("w:sz"), size)
        b.set(qn("w:color"), color)
        tc_borders.append(b)
    tc_pr.append(tc_borders)


def shade_cell(cell, fill="E7E6E6"):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def add_page_number(paragraph):
    run = paragraph.add_run()
    run.font.name = "Times New Roman"
    run.font.size = Pt(10)
    fld_char_1 = OxmlElement("w:fldChar")
    fld_char_1.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    fld_char_2 = OxmlElement("w:fldChar")
    fld_char_2.set(qn("w:fldCharType"), "end")
    run._r.append(fld_char_1)
    run._r.append(instr)
    run._r.append(fld_char_2)


def apply_body_paragraph_format(paragraph, *, alignment=WD_ALIGN_PARAGRAPH.JUSTIFY):
    paragraph.alignment = alignment
    pf = paragraph.paragraph_format
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.15
    pf.space_after = Pt(6)


def heading_paragraph(doc, level, text):
    p = doc.add_paragraph()
    sizes = {1: 18, 2: 14, 3: 12, 4: 11}
    space_before = {1: 18, 2: 14, 3: 10, 4: 8}
    space_after = {1: 8, 2: 6, 3: 4, 4: 4}
    _add_run(p, text, bold=True, size=sizes.get(level, 12))
    pf = p.paragraph_format
    pf.space_before = Pt(space_before.get(level, 8))
    pf.space_after = Pt(space_after.get(level, 4))
    pf.keep_with_next = True
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    return p


# ---------- markdown parser ----------

def parse_markdown(text):
    """Yield block tokens: ('heading', level, text), ('para', text), ('hr',),
    ('table', rows), ('code', lang, code), ('ul', items), ('ol', items), ('blockquote', text)."""
    lines = text.split("\n")
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]
        stripped = line.strip()

        # blank line
        if not stripped:
            i += 1
            continue

        # horizontal rule
        if stripped in {"---", "***", "___"}:
            yield ("hr",)
            i += 1
            continue

        # heading
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            level = len(m.group(1))
            yield ("heading", level, m.group(2).strip())
            i += 1
            continue

        # code fence
        if stripped.startswith("```"):
            lang = stripped[3:].strip()
            i += 1
            code_lines = []
            while i < n and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            i += 1  # skip closing fence
            yield ("code", lang, "\n".join(code_lines))
            continue

        # blockquote
        if stripped.startswith(">"):
            quote_lines = []
            while i < n and lines[i].strip().startswith(">"):
                quote_lines.append(lines[i].strip().lstrip(">").lstrip())
                i += 1
            yield ("blockquote", " ".join(quote_lines).strip())
            continue

        # table (line containing | followed by a separator row)
        if "|" in line and i + 1 < n and re.match(r"^\s*\|?\s*[:\-| ]+\|?\s*$", lines[i + 1]):
            header = [c.strip() for c in line.strip().strip("|").split("|")]
            i += 2  # header + separator
            rows = [header]
            while i < n and "|" in lines[i] and lines[i].strip():
                row = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                rows.append(row)
                i += 1
            yield ("table", rows)
            continue

        # unordered list
        if re.match(r"^[-*+]\s+", stripped):
            items = []
            while i < n:
                m = re.match(r"^([-*+])\s+(.*)$", lines[i].strip())
                if not m:
                    break
                items.append(m.group(2))
                i += 1
            yield ("ul", items)
            continue

        # ordered list
        if re.match(r"^\d+\.\s+", stripped):
            items = []
            while i < n:
                m = re.match(r"^\d+\.\s+(.*)$", lines[i].strip())
                if not m:
                    break
                items.append(m.group(1))
                i += 1
            yield ("ol", items)
            continue

        # paragraph: collect until blank line or new block
        para_lines = [line]
        i += 1
        while i < n:
            nxt = lines[i]
            s = nxt.strip()
            if not s:
                break
            if s in {"---", "***", "___"}:
                break
            if re.match(r"^#{1,6}\s+", s):
                break
            if s.startswith("```"):
                break
            if s.startswith(">"):
                break
            if re.match(r"^[-*+]\s+", s) or re.match(r"^\d+\.\s+", s):
                break
            if "|" in s and i + 1 < n and re.match(r"^\s*\|?\s*[:\-| ]+\|?\s*$", lines[i + 1]):
                break
            para_lines.append(nxt)
            i += 1
        yield ("para", " ".join(l.strip() for l in para_lines))


# ---------- renderer ----------

def render(doc, tokens):
    in_cover_page = True
    saw_first_h2 = False  # after the first '##' we end the cover

    for token in tokens:
        kind = token[0]

        if kind == "heading":
            _, level, text = token
            # The very first H1 of the document is the cover-page title; render larger and centered.
            if in_cover_page and level == 1:
                p = doc.add_paragraph()
                _add_run(p, text, bold=True, size=24)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(72)
                p.paragraph_format.space_after = Pt(18)
                continue
            if in_cover_page and level == 2 and not saw_first_h2:
                # Cover-page subtitle (project subtitle), still on cover page
                p = doc.add_paragraph()
                _add_run(p, text, bold=False, italic=True, size=16)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_after = Pt(36)
                saw_first_h2 = True
                continue
            # Once we hit the Abstract heading, end cover page
            if in_cover_page and text.lower().startswith("abstract"):
                doc.add_page_break()
                in_cover_page = False
            heading_paragraph(doc, level, text)
            continue

        if kind == "hr":
            # Horizontal rule -> add an empty paragraph with bottom border, except inside cover page
            if in_cover_page:
                continue
            p = doc.add_paragraph()
            pPr = p._p.get_or_add_pPr()
            pBdr = OxmlElement("w:pBdr")
            bottom = OxmlElement("w:bottom")
            bottom.set(qn("w:val"), "single")
            bottom.set(qn("w:sz"), "6")
            bottom.set(qn("w:space"), "1")
            bottom.set(qn("w:color"), "BFBFBF")
            pBdr.append(bottom)
            pPr.append(pBdr)
            continue

        if kind == "para":
            _, text = token
            p = doc.add_paragraph()
            add_inline(p, text)
            apply_body_paragraph_format(p)
            continue

        if kind == "blockquote":
            _, text = token
            p = doc.add_paragraph()
            _add_run(p, text, italic=True)
            pf = p.paragraph_format
            pf.left_indent = Cm(1)
            pf.right_indent = Cm(1)
            pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
            pf.line_spacing = 1.15
            pf.space_after = Pt(8)
            # Add left border
            pPr = p._p.get_or_add_pPr()
            pBdr = OxmlElement("w:pBdr")
            left = OxmlElement("w:left")
            left.set(qn("w:val"), "single")
            left.set(qn("w:sz"), "12")
            left.set(qn("w:space"), "12")
            left.set(qn("w:color"), "999999")
            pBdr.append(left)
            pPr.append(pBdr)
            continue

        if kind == "code":
            _, lang, code = token
            p = doc.add_paragraph()
            _add_run(p, code, code=True)
            pf = p.paragraph_format
            pf.left_indent = Cm(0.6)
            pf.line_spacing_rule = WD_LINE_SPACING.SINGLE
            pf.space_after = Pt(8)
            # Light grey shading
            pPr = p._p.get_or_add_pPr()
            shd = OxmlElement("w:shd")
            shd.set(qn("w:val"), "clear")
            shd.set(qn("w:color"), "auto")
            shd.set(qn("w:fill"), "F4F4F4")
            pPr.append(shd)
            continue

        if kind == "ul":
            _, items = token
            for it in items:
                p = doc.add_paragraph(style="List Bullet")
                add_inline(p, it)
                pf = p.paragraph_format
                pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
                pf.line_spacing = 1.15
                pf.space_after = Pt(2)
            continue

        if kind == "ol":
            _, items = token
            for it in items:
                p = doc.add_paragraph(style="List Number")
                add_inline(p, it)
                pf = p.paragraph_format
                pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
                pf.line_spacing = 1.15
                pf.space_after = Pt(2)
            continue

        if kind == "table":
            _, rows = token
            cols = max(len(r) for r in rows)
            tbl = doc.add_table(rows=len(rows), cols=cols)
            tbl.autofit = True
            for ri, row in enumerate(rows):
                for ci in range(cols):
                    cell = tbl.cell(ri, ci)
                    cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP
                    set_cell_borders(cell)
                    text = row[ci] if ci < len(row) else ""
                    # Reset default cell paragraph
                    cell.text = ""
                    p = cell.paragraphs[0]
                    add_inline(p, text)
                    for run in p.runs:
                        run.font.name = "Times New Roman"
                        run.font.size = Pt(10)
                        if ri == 0:
                            run.bold = True
                    p.paragraph_format.space_after = Pt(2)
                    if ri == 0:
                        shade_cell(cell, fill="D9E1F2")
            # Small space after the table
            spacer = doc.add_paragraph()
            spacer.paragraph_format.space_after = Pt(6)
            continue


# ---------- document setup ----------

def setup_document(doc):
    # Default style
    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(12)
    rpr = style.element.get_or_add_rPr()
    rFonts = rpr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rpr.append(rFonts)
    rFonts.set(qn("w:ascii"), "Times New Roman")
    rFonts.set(qn("w:hAnsi"), "Times New Roman")
    rFonts.set(qn("w:eastAsia"), "Times New Roman")
    rFonts.set(qn("w:cs"), "Times New Roman")

    pf = style.paragraph_format
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.15

    # Margins: 1 inch all around
    for section in doc.sections:
        section.top_margin = Cm(2.54)
        section.bottom_margin = Cm(2.54)
        section.left_margin = Cm(2.54)
        section.right_margin = Cm(2.54)

    # Footer with page number on the right
    footer = doc.sections[0].footer
    footer_p = footer.paragraphs[0]
    footer_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    add_page_number(footer_p)


# ---------- run ----------

def main():
    text = SRC.read_text(encoding="utf-8")
    tokens = list(parse_markdown(text))

    doc = Document()
    setup_document(doc)
    render(doc, tokens)
    doc.save(DST)
    print(f"Wrote {DST}")


if __name__ == "__main__":
    main()
