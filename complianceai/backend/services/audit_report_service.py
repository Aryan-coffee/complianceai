from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER
from datetime import datetime
import io

NAVY = HexColor("#0A1628")
ACCENT = HexColor("#4F8EF7")
SUCCESS = HexColor("#22C55E")
WARNING = HexColor("#F59E0B")
DANGER = HexColor("#EF4444")
GRAY = HexColor("#64748B")
TEXT = HexColor("#1E293B")
WHITE = white
LIGHT = HexColor("#F8FAFC")
BORDER = HexColor("#E2E8F0")

def header_footer(canvas, doc):
    canvas.saveState()
    W, H = A4
    canvas.setFillColor(NAVY)
    canvas.rect(0, H-50, W, 50, fill=1, stroke=0)
    canvas.setFillColor(ACCENT)
    canvas.rect(0, H-53, W, 3, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawString(1.5*cm, H-33, "ComplianceAI")
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(HexColor("#94A3B8"))
    canvas.drawRightString(W-1.5*cm, H-33, "AI Governance Audit Report")
    canvas.setFillColor(BORDER)
    canvas.rect(0, 0, W, 35, fill=1, stroke=0)
    canvas.setFillColor(GRAY)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(1.5*cm, 12, "AI-generated audit report. Not a substitute for professional audit. ISO/IEC 42001 aligned.")
    canvas.drawRightString(W-1.5*cm, 12, f"Page {doc.page} | ComplianceAI {datetime.now().year}")
    canvas.restoreState()

def generate_audit_report(org_name, industry, score, answers, sections):
    buffer = io.BytesIO()
    doc = BaseDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=1.5*cm, leftMargin=1.5*cm, rightMargin=1.5*cm)
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height-1.2*cm, id="main")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=header_footer)])

    def S(name, **kw):
        return ParagraphStyle(name, **kw)

    title_s = S("T", fontSize=22, textColor=NAVY, fontName="Helvetica-Bold", spaceAfter=4, leading=26)
    sub_s = S("ST", fontSize=11, textColor=GRAY, fontName="Helvetica", spaceAfter=12)
    sec_s = S("SH", fontSize=13, textColor=NAVY, fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=6)
    body_s = S("B", fontSize=10, textColor=TEXT, fontName="Helvetica", leading=14, spaceAfter=6)
    small_s = S("SM", fontSize=9, textColor=GRAY, fontName="Helvetica", leading=12)
    center_s = S("C", fontSize=10, textColor=TEXT, fontName="Helvetica", alignment=TA_CENTER)

    MATURITY = [
        (0, 25, "Initial", "Critical risk. No formal AI governance.", "#EF4444"),
        (26, 50, "Developing", "Some policies but inconsistently applied.", "#F59E0B"),
        (51, 70, "Defined", "Documented processes in place.", "#4F8EF7"),
        (71, 85, "Managed", "Proactive governance and monitoring.", "#22C55E"),
        (86, 100, "Optimized", "Industry-leading AI compliance.", "#7C3AED"),
    ]

    level = "Initial"
    level_desc = "Unknown"
    level_color = DANGER
    for s, e, lv, desc, col in MATURITY:
        if s <= score <= e:
            level = lv
            level_desc = desc
            level_color = HexColor(col)
            break

    story = []
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("AI Governance Audit Report", title_s))
    story.append(Paragraph(f"{org_name} | Industry: {industry or 'Not specified'} | {datetime.now().strftime('%B %d, %Y')}", sub_s))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=12))

    # Score card
    sc_color = DANGER if score < 40 else (WARNING if score < 70 else SUCCESS)
    score_data = [[
        Paragraph(f'<font size="36" color="{sc_color.hexval()}"><b>{score}</b></font><br/><font size="9" color="#64748B">out of 100</font>', center_s),
        Table([
            [Paragraph("<b>Maturity Level</b>", small_s), Paragraph(f'<font color="{level_color.hexval()}"><b>{level}</b></font>', body_s)],
            [Paragraph("<b>Organization</b>", small_s), Paragraph(f"<b>{org_name}</b>", body_s)],
            [Paragraph("<b>Industry</b>", small_s), Paragraph(industry or "Not specified", body_s)],
            [Paragraph("<b>Domains Assessed</b>", small_s), Paragraph(str(len(sections)), body_s)],
            [Paragraph("<b>Questions Answered</b>", small_s), Paragraph(str(len(answers)), body_s)],
            [Paragraph("<b>Audit Date</b>", small_s), Paragraph(datetime.now().strftime("%B %d, %Y"), body_s)],
        ], colWidths=[3.5*cm, 9*cm],
           style=TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),('LINEBELOW',(0,0),(-1,-2),0.3,BORDER)]))
    ]]
    st = Table(score_data, colWidths=[3.5*cm, 13.5*cm])
    st.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),LIGHT),('BOX',(0,0),(-1,-1),0.5,BORDER),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('PADDING',(0,0),(-1,-1),12),('LINEAFTER',(0,0),(0,-1),0.5,BORDER)]))
    story.append(st)
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph(f'<font color="{level_color.hexval()}"><b>{level}:</b></font> {level_desc}', body_s))

    # Maturity scale
    story.append(Paragraph("Maturity Scale", sec_s))
    mat_data = [["Level", "Range", "Description"]]
    for s2, e2, lv2, desc2, col2 in MATURITY:
        mat_data.append([
            Paragraph(f'<font color="{col2}"><b>{lv2}</b></font>', S("ml"+lv2, fontSize=9, textColor=TEXT, fontName="Helvetica-Bold")),
            Paragraph(f"{s2}-{e2}", small_s),
            Paragraph(desc2, small_s)
        ])
    mat_table = Table(mat_data, colWidths=[3*cm, 2*cm, 12*cm])
    mat_table.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),WHITE),
        ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),9),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[WHITE,LIGHT]),('GRID',(0,0),(-1,-1),0.3,BORDER),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
        ('LEFTPADDING',(0,0),(-1,-1),8),
    ]))
    story.append(mat_table)
    story.append(Spacer(1, 0.3*cm))

    # Section scores
    story.append(Paragraph("Domain Assessment Results", sec_s))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=8))

    for sec in sections:
        sec_id = sec.get("id", "")
        sec_title = sec.get("title", "")
        sec_icon = sec.get("icon", "")
        sec_questions = sec.get("questions", [])

        sec_answers = {k: v for k, v in answers.items() if k.startswith(sec_id)}
        yes_count = sum(1 for v in sec_answers.values() if v == "yes")
        partial_count = sum(1 for v in sec_answers.values() if v == "partial")
        na_count = sum(1 for v in sec_answers.values() if v == "na")
        applicable = len(sec_questions) - na_count
        sec_score = round(((yes_count + partial_count * 0.5) / applicable) * 100) if applicable > 0 else 0
        sc2 = DANGER if sec_score < 40 else (WARNING if sec_score < 70 else SUCCESS)

        story.append(Spacer(1, 0.2*cm))
        ch = Table([[
            Paragraph(f'<b>{sec_icon} {sec_title}</b>', S("ch"+sec_id, fontSize=11, textColor=NAVY, fontName="Helvetica-Bold")),
            Paragraph(f'<font color="{sc2.hexval()}"><b>{sec_score}%</b></font>', S("rs"+sec_id, fontSize=11, textColor=TEXT, fontName="Helvetica-Bold", alignment=TA_CENTER)),
        ]], colWidths=[12*cm, 5*cm])
        ch.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LINEBELOW',(0,0),(-1,-1),1,ACCENT),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
        story.append(ch)

        q_data = [["#", "Checklist Item", "Status"]]
        for i, q in enumerate(sec_questions):
            key = f"{sec_id}-{i}"
            ans = answers.get(key, "N/A")
            ans_display = ans.upper() if ans else "N/A"
            ans_color = SUCCESS if ans == "yes" else (WARNING if ans == "partial" else (GRAY if ans == "na" else DANGER))
            q_data.append([
                Paragraph(str(i+1), small_s),
                Paragraph(q, small_s),
                Paragraph(f'<font color="{ans_color.hexval()}"><b>{ans_display}</b></font>', S("ac"+sec_id+str(i), fontSize=9, textColor=TEXT, fontName="Helvetica-Bold", alignment=TA_CENTER))
            ])

        q_table = Table(q_data, colWidths=[1*cm, 13*cm, 3*cm])
        q_table.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(-1,0),HexColor("#112240")),('TEXTCOLOR',(0,0),(-1,0),WHITE),
            ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),8),
            ('ROWBACKGROUNDS',(0,1),(-1,-1),[WHITE,LIGHT]),('GRID',(0,0),(-1,-1),0.3,BORDER),
            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
            ('LEFTPADDING',(0,0),(-1,-1),6),('ALIGN',(2,0),(2,-1),'CENTER'),
        ]))
        story.append(q_table)
        story.append(Spacer(1, 0.2*cm))

    # Recommendations
    weak = [s3 for s3 in sections if True]
    story.append(Paragraph("Recommendations & Next Steps", sec_s))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=8))

    for sec in sections:
        sec_id = sec.get("id", "")
        sec_title = sec.get("title", "")
        sec_questions = sec.get("questions", [])
        sec_answers2 = {k: v for k, v in answers.items() if k.startswith(sec_id)}
        yes2 = sum(1 for v in sec_answers2.values() if v == "yes")
        partial2 = sum(1 for v in sec_answers2.values() if v == "partial")
        na2 = sum(1 for v in sec_answers2.values() if v == "na")
        app2 = len(sec_questions) - na2
        ss2 = round(((yes2 + partial2 * 0.5) / app2) * 100) if app2 > 0 else 0
        if ss2 < 70:
            priority = "Critical" if ss2 < 40 else "High"
            p_color = DANGER if priority == "Critical" else WARNING
            story.append(Paragraph(f'<font color="{p_color.hexval()}"><b>[{priority}]</b></font> {sec_title} ({ss2}%) - Develop formal policies, assign ownership, implement controls, and establish monitoring.', small_s))

    # Disclaimer
    story.append(Spacer(1, 0.5*cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=6))
    story.append(Paragraph("This AI governance audit report is generated by ComplianceAI for informational purposes only. It does not constitute legal advice or a formal audit opinion. Results are based on self-reported answers. Consult qualified professionals for formal compliance assessments. Aligned with ISO/IEC 42001 AI Management System standard.", small_s))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
