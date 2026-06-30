from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import io

NAVY = HexColor("#0A1628")
NAVY2 = HexColor("#112240")
ACCENT = HexColor("#4F8EF7")
SUCCESS = HexColor("#22C55E")
WARNING = HexColor("#F59E0B")
DANGER = HexColor("#EF4444")
GRAY = HexColor("#64748B")
WHITE = white
TEXT = HexColor("#1E293B")

def header_footer(canvas, doc):
    canvas.saveState()
    W, H = A4
    canvas.setFillColor(NAVY)
    canvas.rect(0, H-52, W, 52, fill=1, stroke=0)
    canvas.setFillColor(ACCENT)
    canvas.rect(0, H-55, W, 3, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 15)
    canvas.drawString(1.5*cm, H-34, "ComplianceAI")
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(HexColor("#94A3B8"))
    canvas.drawRightString(W-1.5*cm, H-34, "AI Compliance Report")
    canvas.setFillColor(HexColor("#E2E8F0"))
    canvas.rect(0, 0, W, 40, fill=1, stroke=0)
    canvas.setFillColor(GRAY)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(1.5*cm, 14, "AI-generated report for informational purposes only. Not legal advice.")
    canvas.drawRightString(W-1.5*cm, 14, f"Page {doc.page} | ComplianceAI 2024")
    canvas.restoreState()

def generate_pdf_report(check_data, user_data):
    buffer = io.BytesIO()
    doc = BaseDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm, leftMargin=1.8*cm, rightMargin=1.8*cm)
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height-1.5*cm, id="main")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=header_footer)])

    def S(name, **kw): return ParagraphStyle(name, **kw)
    title_s = S("T", fontSize=22, textColor=NAVY, fontName="Helvetica-Bold", spaceAfter=4, leading=26)
    sec_s = S("SH", fontSize=13, textColor=NAVY, fontName="Helvetica-Bold", spaceBefore=16, spaceAfter=8)
    body_s = S("B", fontSize=10, textColor=TEXT, fontName="Helvetica", leading=15, spaceAfter=6)
    small_s = S("SM", fontSize=9, textColor=GRAY, fontName="Helvetica", leading=13)
    center_s = S("C", fontSize=10, textColor=TEXT, fontName="Helvetica", alignment=TA_CENTER)

    story = []
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph(f"AI Compliance Report", title_s))
    story.append(Paragraph(f"{check_data.get('ai_system_name','AI System')} | {datetime.now().strftime('%B %d, %Y')}", S("ST", fontSize=11, textColor=GRAY, fontName="Helvetica", spaceAfter=14)))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=14))

    score = check_data.get("overall_score", 0)
    status = check_data.get("overall_status", "Unknown")
    risk = check_data.get("overall_risk", "Unknown")
    sc_color = DANGER if score < 40 else (WARNING if score < 70 else SUCCESS)

    summary_data = [
        [Paragraph(f'<font size="40" color="{sc_color.hexval()}"><b>{score}</b></font><br/><font size="9" color="#64748B">out of 100</font>', center_s),
         Table([
             [Paragraph("<b>Status</b>", S("l", fontSize=10, textColor=GRAY, fontName="Helvetica-Bold")), Paragraph(f'<font color="{sc_color.hexval()}"><b>{status}</b></font>', body_s)],
             [Paragraph("<b>Risk Level</b>", S("l", fontSize=10, textColor=GRAY, fontName="Helvetica-Bold")), Paragraph(risk, body_s)],
             [Paragraph("<b>System</b>", S("l", fontSize=10, textColor=GRAY, fontName="Helvetica-Bold")), Paragraph(check_data.get("ai_system_name",""), body_s)],
             [Paragraph("<b>Industry</b>", S("l", fontSize=10, textColor=GRAY, fontName="Helvetica-Bold")), Paragraph(check_data.get("industry",""), body_s)],
             [Paragraph("<b>Countries</b>", S("l", fontSize=10, textColor=GRAY, fontName="Helvetica-Bold")), Paragraph(", ".join(check_data.get("selected_countries",[])), body_s)],
         ], colWidths=[3*cm, 9*cm],
            style=TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))]
    ]
    st = Table(summary_data, colWidths=[3.5*cm, 13.5*cm])
    st.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),HexColor("#F8FAFC")),('BOX',(0,0),(-1,-1),0.5,HexColor("#E2E8F0")),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('PADDING',(0,0),(-1,-1),14),('LINEAFTER',(0,0),(0,-1),0.5,HexColor("#E2E8F0"))]))
    story.append(st)
    story.append(Spacer(1, 0.4*cm))

    country_results = check_data.get("country_results", {})
    if country_results:
        story.append(Paragraph("Country-by-Country Analysis", sec_s))
        story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#E2E8F0"), spaceAfter=10))
        for country, result in country_results.items():
            cs = result.get("compliance_score", 0)
            cc = DANGER if cs < 40 else (WARNING if cs < 70 else SUCCESS)
            story.append(Paragraph(f'{country} — {result.get("regulation_name","")}', S("ch", fontSize=12, textColor=NAVY, fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=4)))
            story.append(Paragraph(f'Score: <font color="{cc.hexval()}"><b>{cs}/100</b></font> | Status: <font color="{cc.hexval()}"><b>{result.get("status","")}</b></font> | Risk: {result.get("risk_level","")}', body_s))
            if result.get("full_analysis"):
                story.append(Paragraph(result["full_analysis"], body_s))
            issues = result.get("issues", [])
            if issues:
                story.append(Paragraph("Issues Found:", S("ih", fontSize=10, textColor=DANGER, fontName="Helvetica-Bold", spaceAfter=3)))
                for issue in issues[:5]:
                    story.append(Paragraph(f"• {issue}", small_s))
            recs = result.get("recommendations", [])
            if recs:
                story.append(Paragraph("Recommendations:", S("rh", fontSize=10, textColor=SUCCESS, fontName="Helvetica-Bold", spaceAfter=3, spaceBefore=6)))
                for rec in recs[:5]:
                    story.append(Paragraph(f"• {rec}", small_s))
            story.append(Spacer(1, 0.2*cm))

    story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#E2E8F0"), spaceAfter=8))
    story.append(Paragraph("This report is AI-generated for informational purposes only. Consult qualified legal professionals for formal compliance advice.", small_s))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
