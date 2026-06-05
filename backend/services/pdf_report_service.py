import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def generate_pdf_report(analysis_data: dict, username: str) -> io.BytesIO:
    """
    Generates a stylized PDF report using ReportLab.
    Returns the PDF as an in-memory BytesIO stream.
    """
    buffer = io.BytesIO()
    
    # Page setup - 0.5 inch margins (36 points) for more printable room
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    # Primary theme colors
    primary_color = colors.HexColor("#1e1b4b")  # Dark Indigo
    secondary_color = colors.HexColor("#4f46e5")  # Indigo Accent
    dark_gray = colors.HexColor("#334155")
    light_bg = colors.HexColor("#f8fafc")
    emerald_bg = colors.HexColor("#d1fae5")
    emerald_text = colors.HexColor("#065f46")
    rose_bg = colors.HexColor("#fee2e2")
    rose_text = colors.HexColor("#991b1b")
    
    # Modify default styles or add new ones
    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        alignment=TA_LEFT
    )
    
    subtitle_style = ParagraphStyle(
        'ReportSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748b"),
        alignment=TA_LEFT
    )
    
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=dark_gray
    )
    
    score_label_style = ParagraphStyle(
        'ScoreLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_color
    )
    
    score_num_style = ParagraphStyle(
        'ScoreNum',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=32,
        textColor=secondary_color,
        alignment=TA_CENTER
    )
    
    score_level_style = ParagraphStyle(
        'ScoreLevel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0f766e"), # Teal
        alignment=TA_CENTER
    )
    
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=colors.white
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=dark_gray
    )
    
    tag_green_style = ParagraphStyle(
        'TagGreen',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=emerald_text
    )
    
    tag_red_style = ParagraphStyle(
        'TagRed',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=rose_text
    )

    story = []
    
    # --- HEADER SECTION ---
    # Draw a colored banner top bar
    story.append(Paragraph("CAREERPILOT AI - PORTFOLIO READINESS REPORT", title_style))
    story.append(Paragraph(f"Candidate: {username}  |  Role Target: {analysis_data.get('role')}  |  Engine: {analysis_data.get('engine', 'Heuristic')}", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=secondary_color, spaceBefore=1, spaceAfter=12))
    
    # --- OVERVIEW SECTION (Score Panel) ---
    score = analysis_data.get('score', 0)
    readiness_level = analysis_data.get('readiness_level', 'Unknown')
    
    # Create descriptive summary text
    summary_text = (
        f"This report presents a gap analysis of your resume skills against industry requirements for a <b>{analysis_data.get('role')}</b>. "
        f"Your current readiness score is <b>{score}/100</b>, placing you in the <b>{readiness_level}</b> bracket. "
        f"We have identified {len(analysis_data.get('matched_skills', []))} matched skills present in your profile, and "
        f"{len(analysis_data.get('missing_skills', []))} key skills recommended for development."
    )
    
    overview_table_data = [
        [
            Paragraph(summary_text, body_style),
            [
                Paragraph("READINESS SCORE", score_label_style),
                Spacer(1, 4),
                Paragraph(f"{score}", score_num_style),
                Spacer(1, 4),
                Paragraph(readiness_level, score_level_style)
            ]
        ]
    ]
    
    overview_table = Table(overview_table_data, colWidths=[400, 140])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), light_bg),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor("#eef2ff")), # light indigo
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 12),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    
    story.append(overview_table)
    story.append(Spacer(1, 15))
    
    # --- SKILL MATCHING SECTION ---
    story.append(Paragraph("SKILL BREAKDOWN ANALYSIS", heading_style))
    
    matched = analysis_data.get('matched_skills', [])
    missing = analysis_data.get('missing_skills', [])
    
    # Helper to construct bullet tag lists inside a table cell
    def build_skill_cells(skills, is_matched):
        bg = emerald_bg if is_matched else rose_bg
        text_style = tag_green_style if is_matched else tag_red_style
        
        cells = []
        if not skills:
            return [Paragraph("None detected", body_style)]
            
        for s in skills:
            cell_data = [[Paragraph(s, text_style)]]
            t = Table(cell_data, colWidths=[110])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (0,0), bg),
                ('ALIGN', (0,0), (0,0), 'CENTER'),
                ('VALIGN', (0,0), (0,0), 'MIDDLE'),
                ('PADDING', (0,0), (0,0), 4),
                ('BOTTOMPADDING', (0,0), (0,0), 4),
                ('TOPPADDING', (0,0), (0,0), 4),
                ('BOX', (0,0), (0,0), 0.5, colors.HexColor("#94a3b8") if is_matched else colors.HexColor("#cbd5e1")),
            ]))
            cells.append(t)
            cells.append(Spacer(1, 4))
        return cells
        
    matched_cells = build_skill_cells(matched, True)
    missing_cells = build_skill_cells(missing, False)
    
    # Find max length to align table rows
    max_len = max(len(matched_cells), len(missing_cells))
    
    skills_table_data = [
        [Paragraph("Matched Skills (Found in Profile)", table_header_style), Paragraph("Recommended Skills (Growth Area)", table_header_style)]
    ]
    
    # Pack cells side by side
    skills_flow_table_data = []
    
    # Group flowables into nested tables or direct cell arrays
    matched_container = Table([[matched_cells]], colWidths=[250])
    matched_container.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 0),
    ]))
    
    missing_container = Table([[missing_cells]], colWidths=[250])
    missing_container.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 0),
    ]))
    
    skills_table_data.append([matched_container, missing_container])
    
    skills_table = Table(skills_table_data, colWidths=[270, 270])
    skills_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#059669")), # Green
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor("#dc2626")), # Red
        ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    
    story.append(skills_table)
    story.append(Spacer(1, 15))
    
    # --- LEARNING RESOURCES SECTION ---
    story.append(Paragraph("RECOMMENDED LEARNING RESOURCES", heading_style))
    
    resources = analysis_data.get('learning_resources', [])
    resource_table_data = [
        [
            Paragraph("Resource Name", table_header_style),
            Paragraph("Type", table_header_style),
            Paragraph("Details & Description", table_header_style)
        ]
    ]
    
    if resources:
        for res in resources:
            desc_text = f"{res.get('desc', '')}<br/><font color='#4f46e5'><b>Link:</b> {res.get('url', '#')}</font>"
            resource_table_data.append([
                Paragraph(res.get('name', 'N/A'), table_cell_style),
                Paragraph(res.get('type', 'N/A'), table_cell_style),
                Paragraph(desc_text, table_cell_style)
            ])
    else:
        resource_table_data.append([Paragraph("No specific recommendations needed. Your profile is comprehensive!", table_cell_style), "", ""])
        
    resource_table = Table(resource_table_data, colWidths=[160, 80, 300])
    resource_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, light_bg]),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    
    story.append(resource_table)
    story.append(Spacer(1, 15))
    
    # --- PERSONALIZED ROADMAP SECTION ---
    story.append(Paragraph("PERSONALIZED 12-WEEK ROADMAP", heading_style))
    
    roadmap = analysis_data.get('roadmap', [])
    if roadmap:
        for phase in roadmap:
            phase_title = f"<b>{phase.get('phase', 'Phase')} ({phase.get('duration', '')})</b>"
            phase_desc = phase.get('description', '')
            phase_topics = ", ".join(phase.get('topics', []))
            
            phase_content = (
                f"<font size='10' color='#1e1b4b'><b>{phase_title}</b></font><br/>"
                f"{phase_desc}<br/>"
                f"<font color='#4f46e5'><b>Action Items:</b></font> {phase_topics}"
            )
            
            phase_table_data = [[Paragraph(phase_content, body_style)]]
            phase_table = Table(phase_table_data, colWidths=[540])
            phase_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, 0), light_bg),
                ('PADDING', (0, 0), (0, 0), 8),
                ('BOX', (0, 0), (0, 0), 1, colors.HexColor("#e2e8f0")),
                ('LINELEFT', (0, 0), (0, 0), 4, secondary_color),
            ]))
            story.append(phase_table)
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No study phases scheduled. Keep tracking your career goals!", body_style))
        
    # Build Document
    doc.build(story)
    buffer.seek(0)
    return buffer
