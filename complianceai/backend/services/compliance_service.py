import os, json, sys
from groq import Groq

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.config import settings

def get_groq_client():
    return Groq(api_key=settings.GROQ_API_KEY)

REGULATIONS = {
    "EU": {
        "name": "EU AI Act 2024",
        "content": """EU AI Act - Effective August 2024, Full enforcement 2026.
Prohibited AI (Article 5): Social scoring, real-time biometric surveillance in public, emotion recognition in workplace/education, AI exploiting vulnerabilities, subliminal manipulation.
High-Risk AI (Annex III): Biometric identification, critical infrastructure, education, employment/HR, essential services, law enforcement, migration, justice.
High-Risk Requirements: Conformity assessment, technical documentation, human oversight, accuracy/robustness, transparency, data governance, logging.
GPAI Models: Transparency, copyright compliance, systemic risk assessment for powerful models.
Penalties: Up to 35M euros or 7% global revenue for prohibited AI; 15M or 3% for high-risk violations.
Transparency: AI-generated content must be labeled. Users must be informed when interacting with AI.
Timeline: Prohibited AI banned Aug 2024, GPAI rules Feb 2025, High-risk obligations Aug 2025, Full enforcement Aug 2026."""
    },
    "India": {
        "name": "India Complete AI Compliance Framework 2026",
        "content": """INDIA COMPLETE AI COMPLIANCE & AUDIT FRAMEWORK - June 2026
ALL applicable laws, regulations, guidelines, and sectoral rules:

=== 1. IT ACT 2000 + AMENDMENTS ===
Information Technology Act 2000 (as amended 2008):
- Section 43A: Compensation for failure to protect personal data - reasonable security practices mandatory
- Section 66: Computer-related offences including AI misuse
- Section 69: Government power to intercept/monitor/decrypt - AI systems must comply
- Section 72A: Punishment for disclosure of personal information in breach of lawful contract
- Section 79: Intermediary liability - safe harbour provisions for AI platforms
- IT (Reasonable Security Practices) Rules 2011: ISO 27001 or equivalent mandatory
- IT (Intermediary Guidelines) Rules 2021: Due diligence by AI platforms, content moderation

=== 2. IT AMENDMENT RULES 2026 (SGI) - EFFECTIVE 20 FEB 2026 ===
Synthetically Generated Information (SGI) Compliance:
- ALL AI-generated content MUST have visible/audible labels - clear and prominent
- C2PA-compatible metadata with unique ID and computer resource ID required
- User declaration checkpoint at upload time mandatory
- SGI Detection and Classification System must be deployed
- Takedown timelines: High-risk deepfakes/NCII/CSAM = 2 HOURS, Govt/Court notice = 3 HOURS, Individual complaint = 36 HOURS, General grievance = 7 DAYS
- Quarterly transparency reports on SGI detection volume, complaints, govt requests
- User warnings every 3 months with documented delivery proof
- Grievance redressal mechanism accessible and resolving within timelines
- Staff trained on SGI identification and response procedures
- Penalties: Loss of safe harbour + criminal liability

=== 3. DPDP ACT 2023 + RULES 2025 ===
Digital Personal Data Protection Act - Phased rollout 2026-2027:
- Consent: Must be free, specific, informed, unambiguous - in clear plain language
- Consent Notice: In English or ANY of 22 scheduled languages
- Consent withdrawal must be as easy as giving consent
- Purpose limitation: Data only for stated purpose
- Data minimization: Only necessary data collected
- Accuracy: Keep data accurate and updated
- Storage limitation: Defined retention periods, delete when purpose fulfilled
- DPIA mandatory for Significant Data Fiduciaries (SDFs) and high-risk processing
- Breach notification to Data Protection Board within 72 hours + notify affected users
- Data Principal Rights: Right to access, correction, erasure, grievance redressal, nominate
- Cross-border transfer ONLY to government-approved countries (negative list approach)
- Data Processing Agreements (DPAs) with ALL third-party processors mandatory
- Significant Data Fiduciary (SDF) obligations: Appoint DPO (India resident), independent data auditor, DPIA, algorithmic fairness assessment
- Children data (under 18): Verifiable parental consent required, no tracking/behavioral monitoring, no targeted advertising
- Disabled persons: Lawful guardian consent required
- Security: Encryption, MFA, RBAC, audit logs, penetration testing, vulnerability assessment
- Employee DPDP training with completion certificates and annual refreshers
- Data Protection Officer appointment mandatory for SDFs
- PENALTIES: Rs 250 Crore (security safeguards failure), Rs 200 Crore (breach notification failure), Rs 200 Crore (children data violation), Rs 150 Crore (SDF obligations), Rs 50 Crore (other violations)

=== 4. RBI AI GUIDELINES 2024 ===
Reserve Bank of India - AI/ML in Banking and Finance:
- Explainability MANDATORY for credit scoring and lending AI
- No fully automated loan rejection - human review required for ALL rejections
- Bias testing across caste, religion, gender, geography - documented results
- Model risk management framework with board approval
- AI model validation, back-testing, and stress testing mandatory
- Customer grievance redressal mechanism for AI-driven decisions
- Data localization: ALL financial data must stay in India (RBI data localization circular)
- Third-party AI vendor assessment and due diligence required
- Complete audit trail for ALL AI-driven financial decisions
- Fair lending practices - no proxy discrimination via AI
- Board-level oversight and accountability for AI implementations
- Model inventory and documentation for all AI/ML models
- Outsourcing guidelines apply to AI vendor relationships
- Applies to: Banks, NBFCs, payment aggregators, credit scoring, UPI, digital lending
- RBI Master Direction on Digital Lending (2022) compliance
- KYC/AML AI must have human oversight

=== 5. SEBI AI CIRCULAR 2024 ===
Securities and Exchange Board of India - AI in Capital Markets:
- Algo trading AI: Pre-trade risk controls, order-to-trade ratio limits
- AI-based investment advice: SEBI registration as RIA mandatory
- Robo-advisory platforms: Full disclosure of AI use to investors
- Real-time monitoring of AI trading systems mandatory
- Kill switch mechanism for ALL AI trading algorithms
- Stress testing of AI models under various market scenarios
- Client suitability assessment BEFORE AI recommendations
- Quarterly reporting of AI system performance to SEBI
- Data privacy for investor data processed by AI
- Market manipulation detection systems required
- Algo audit trail with timestamps for all AI trades
- SEBI (Investment Advisers) Regulations 2013 compliance
- SEBI (Research Analysts) Regulations 2014 for AI research
- Mutual fund AI must comply with SEBI MF regulations
- Penalties: Monetary penalty + debarment + criminal prosecution

=== 6. IRDAI AI GUIDELINES ===
Insurance Regulatory and Development Authority - AI in Insurance:
- AI underwriting must NOT discriminate on protected characteristics (caste, religion, gender, disability)
- Explainability for claim rejection by AI MANDATORY - clear reasons to policyholder
- Human review of ALL AI-denied insurance claims required
- Premium calculation AI must be transparent and actuarially sound
- Policyholder data protection and explicit consent for AI processing
- AI fraud detection must have false positive review mechanism
- Actuarial validation of AI pricing models required
- Customer complaint mechanism for AI decisions mandatory
- Cross-selling AI must comply with explicit consent rules
- Annual AI audit report submission to IRDAI
- IRDAI (Protection of Policyholders Interests) Regulations compliance
- Telematics and wearable data AI: Specific consent required
- Health insurance AI: No denial based on AI prediction alone

=== 7. CDSCO MEDICAL DEVICE RULES 2017 (AMENDED) ===
Central Drugs Standard Control Organisation - AI in Healthcare:
- AI medical devices REQUIRE CDSCO classification and regulatory approval
- Software as Medical Device (SaMD) - risk-based classification (Class A/B/C/D)
- Clinical validation data required for AI diagnostics before market authorization
- Post-market surveillance for AI medical devices mandatory
- Adverse event reporting within 15 days to CDSCO
- Quality Management System ISO 13485 certification required
- Labeling requirements: Must clearly state AI-assisted diagnosis
- Data privacy for patient health records (DPDP Act applies additionally)
- Cybersecurity requirements for connected AI medical devices
- Clinical investigation rules for AI devices
- Import license required for foreign AI medical devices
- Manufacturing license for Indian AI medical device companies
- Applies to: AI diagnostics, imaging AI, clinical decision support, wearable health AI, robotic surgery AI, drug interaction AI
- Medical Device Rules 2017 Schedule classification
- No AI device can replace physician judgment for treatment decisions

=== 8. MEITY AI GOVERNANCE GUIDELINES ===
Ministry of Electronics and IT - 7 Sutras for Responsible AI:
1. Safety and Reliability: AI must be tested rigorously, fail-safe mechanisms
2. Equality and Non-discrimination: No bias based on caste, religion, gender, disability, geography
3. Inclusivity and Accessibility: AI must work in 22 scheduled languages, accessible to disabled persons
4. Privacy and Data Protection: Full DPDP Act compliance, privacy by design
5. Transparency and Explainability: Users must understand how AI made decisions
6. Accountability and Redressal: Clear responsibility chain, grievance mechanism
7. Protection and Reinforcement of Fundamental Rights: Constitutional rights protected
- IndiaAI Mission guidelines for government AI procurement
- Voluntary but expected to become mandatory

=== 9. NEP 2020 - AI IN EDUCATION ===
National Education Policy 2020 + EdTech Guidelines:
- Student data = children data (under 18) = SPECIAL CATEGORY under DPDP Act
- Verifiable parental consent REQUIRED for student AI profiling
- No behavioral monitoring or tracking of students by AI
- AI-based assessment must be fair, unbiased, and validated
- No fully automated grading for high-stakes examinations
- Digital literacy curriculum must include AI awareness
- Accessibility standards for AI learning tools (WCAG 2.1)
- Data minimization for student information
- Right to human evaluation of AI assessments
- No targeted advertising to students based on AI profiling
- EdTech companies must comply with consumer protection rules
- UGC guidelines on AI in higher education

=== 10. TRAI AI GUIDELINES ===
Telecom Regulatory Authority of India - AI in Telecom:
- AI-based call filtering must NOT censor legitimate communication
- Transparency in AI-driven network management decisions
- Customer data processed by AI needs EXPLICIT consent
- AI spam/fraud detection must have false positive redressal mechanism
- Net neutrality compliance for AI-based traffic management
- Quality of Service monitoring requirements for AI systems
- Subscriber grievance mechanism for AI-driven decisions
- TRAI recommendations on OTT communication services apply to AI bots
- AI in 5G network management: Security and privacy requirements

=== 11. COMPETITION COMMISSION OF INDIA (CCI) ===
CCI Act 2002 - AI and Market Competition:
- AI pricing algorithms must NOT enable price-fixing cartels (Section 3)
- Platform AI must NOT prefer own products - no self-preferencing (Section 4)
- Data accumulation by AI must NOT create monopolistic barriers to entry
- AI-driven market manipulation is anti-competitive under Section 3(3)
- Merger review considers AI capabilities and data assets (Section 5-6)
- Digital markets competition assessment includes AI capabilities
- Hub-and-spoke cartels via AI algorithms are illegal
- Penalties: Up to 10% of average turnover for anti-competitive AI practices
- CCI Digital Markets Study recommendations apply

=== 12. CONSUMER PROTECTION ACT 2019 ===
Consumer Protection for AI Services:
- AI product/service must not be defective or deficient
- Unfair trade practices by AI-based e-commerce prohibited
- Misleading AI advertisements violate Section 2(28)
- Product liability extends to AI-caused harm (Section 82-87)
- E-commerce AI must comply with Consumer Protection (E-Commerce) Rules 2020
- Central Consumer Protection Authority (CCPA) can act against AI harm
- Consumer Dispute Redressal: District, State, National forums
- Class action suits possible for widespread AI harm
- Penalties: Varies by violation, up to Rs 50 lakh fine + imprisonment

=== 13. INDIAN PENAL CODE / BNS 2023 ===
Criminal Liability for AI Misuse:
- Deepfake creation/distribution: Criminal offence under IT Act + BNS
- AI-generated defamation: Section 356 BNS
- AI identity theft: Section 318 BNS
- Cyber terrorism via AI: Section 111 BNS
- AI-facilitated fraud: Section 316-318 BNS
- Voyeurism via AI: Section 77 BNS
- Criminal intimidation via AI: Section 351 BNS

=== 14. LABOUR LAWS - AI IN EMPLOYMENT ===
Employment AI Compliance:
- Industrial Relations Code 2020: AI-driven retrenchment notice requirements
- Equal Remuneration Act: AI must not create gender pay gaps
- Prevention of Sexual Harassment Act: AI must not enable workplace harassment
- Payment of Wages Act: AI payroll must comply with wage regulations
- Contract Labour Act: AI gig economy platforms must comply
- Employee Provident Fund: AI HR must comply with EPF requirements
- Maternity Benefit Act: AI HR decisions must not discriminate against pregnant employees
- Rights of Persons with Disabilities Act 2016: AI must be accessible

=== 15. ENVIRONMENTAL LAW ===
AI Environmental Compliance:
- Environment Protection Act 1986: Large AI data centers need environmental clearance
- E-Waste Management Rules 2016: AI hardware disposal compliance
- Energy Conservation Act: AI data center energy efficiency
- National Green Tribunal jurisdiction for AI environmental harm

=== 16. INTELLECTUAL PROPERTY ===
AI IP Compliance:
- Copyright Act 1957: AI training on copyrighted data - license required
- Patent Act 1970: AI-generated inventions - inventorship questions
- Trademark Act 1999: AI-generated brand confusion
- IT Act Section 66: Unauthorized access to copyrighted content for AI training

=== AUDIT REQUIREMENTS SUMMARY ===
Mandatory Audits for AI Systems in India:
1. DPDP Data Audit: Annual for SDFs, periodic for all data fiduciaries
2. CDSCO Medical Device Audit: Pre-market and annual post-market
3. RBI Model Risk Audit: Annual for all AI/ML models in banking
4. SEBI Algo Audit: Quarterly audit of AI trading systems
5. IRDAI AI Audit: Annual audit report submission
6. ISO 27001 Audit: If handling sensitive personal data under IT Act
7. IT Act Compliance Audit: Reasonable security practices verification
8. Consumer Protection Audit: Product safety and liability assessment
9. Environmental Compliance Audit: For large AI data centers
10. Labour Law Compliance Audit: AI HR systems"""
    },
    "USA": {
        "name": "NIST AI RMF + Executive Order 14110",
        "content": """USA AI Regulations - 2024/2025:
NIST AI Risk Management Framework 1.0: GOVERN, MAP, MEASURE, MANAGE functions.
Executive Order 14110 (Oct 2023): Safety testing for powerful AI, red-teaming, watermarking AI content, federal agency AI safety reports.
Key Requirements: Risk assessment, transparency, human oversight, bias testing, security evaluation.
Sector-specific: FDA for medical AI, CFPB for financial AI, EEOC for employment AI, FTC for consumer AI.
State Laws: Colorado AI Act, California AI transparency, NYC bias audit law (Local Law 144).
Blueprint for AI Bill of Rights: Safe systems, algorithmic discrimination protections, data privacy, notice/explanation, human alternatives."""
    },
    "UK": {
        "name": "UK AI Regulation Framework",
        "content": """UK AI Framework - Pro-innovation, principles-based approach.
5 Principles: Safety/security/robustness, transparency/explainability, fairness, accountability/governance, contestability/redress.
ICO AI Guidance: Data protection in AI, automated decision-making under UK GDPR, DPIA requirements.
AI Safety Institute: Frontier AI safety evaluation, pre-deployment testing.
Sector regulators: FCA (financial), Ofcom (communications), CMA (competition), ICO (data protection)."""
    },
    "Canada": {
        "name": "AIDA - Artificial Intelligence and Data Act",
        "content": """AIDA (Bill C-27): High-impact AI systems regulation.
Requirements: Risk assessment, mitigation measures, monitoring, incident reporting, records keeping.
Prohibited: Reckless use causing serious harm, processing illegally obtained data.
Transparency: Publicly available descriptions of AI systems.
Penalties: Up to CAD 25M or 5% global revenue."""
    },
    "Singapore": {
        "name": "Singapore Model AI Governance Framework",
        "content": """Singapore Model AI Governance Framework 2.0.
4 Areas: Internal governance, risk management, operations management, stakeholder interaction.
AI Verify: Testing framework for responsible AI - fairness, explainability, robustness.
PDPA: Personal Data Protection Act compliance required for all AI data processing.
Advisory Guidelines on AI and Personal Data."""
    },
    "Australia": {
        "name": "Australia AI Ethics Framework",
        "content": """Australia Voluntary AI Ethics Framework - 8 principles.
Principles: Human/social wellbeing, human-centred values, fairness, privacy, reliability/safety, transparency, contestability, accountability.
Privacy Act 1988: Applies to AI processing personal information.
Proposed mandatory guardrails for high-risk AI."""
    },
    "Brazil": {
        "name": "Brazil AI Bill (PL 2338/2023)",
        "content": """Brazil AI Bill - Senate approved, final passage expected 2025.
High-risk AI: Conformity assessment, human oversight, transparency required.
LGPD: Lei Geral de Protecao de Dados applies to AI data processing.
Rights: Explanation of AI decisions, human review, non-discrimination.
Penalties: Up to BRL 50M per violation or 2% revenue."""
    },
    "China": {
        "name": "China AI Regulations 2024",
        "content": """China GenAI Regulations: Registration with CAC mandatory for all generative AI services.
Deep Synthesis Regulations: Labeling of AI-generated content required.
Algorithm Recommendation Regulations: Transparency, user rights to opt-out.
PIPL: Personal Information Protection Law applies to all AI processing.
Data Security Law: Classification and protection requirements.
Penalties: Up to RMB 50M or 5% revenue, service suspension."""
    },
    "Japan": {
        "name": "Japan AI Guidelines 2024",
        "content": """Japan AI Guidelines - Voluntary but widely adopted.
7 Principles: Human-centric, education/literacy, privacy, security, fair competition, fairness/accountability/transparency, innovation.
APPI: Act on Protection of Personal Information applies to AI.
Sector-specific guidance from FSA (financial), MHLW (medical/labor).
AI Safety Institute established for frontier model evaluation."""
    }
}

def run_compliance_check(ai_system_name, ai_system_description, industry, data_types, deployment_regions, countries):
    client = get_groq_client()
    all_results = {}
    total_score = 0
    valid_count = 0

    for country in countries:
        reg_info = REGULATIONS.get(country)
        if not reg_info:
            continue

        prompt = f"""You are an expert AI compliance lawyer for {country} with knowledge updated to June 2026. Analyze this AI system strictly against {reg_info['name']}:

AI System: {ai_system_name}
Description: {ai_system_description}
Industry: {industry}
Data Types: {', '.join(data_types)}

CURRENT REGULATIONS ({reg_info['name']}):
{reg_info['content']}

IMPORTANT: Be thorough. Check EVERY applicable regulation section. For India, check ALL 10 regulatory bodies if relevant.

Reply with ONLY valid JSON, no markdown:
{{"status":"Compliant","compliance_score":75,"risk_level":"Medium","issues":["issue1","issue2"],"recommendations":["fix1","fix2"],"relevant_clauses":["Specific law/section: explanation"],"full_analysis":"Detailed 3-4 paragraph analysis covering all applicable regulations.","summary_one_line":"One sentence verdict"}}

Rules:
- status: Compliant (score 70-100), Partially Compliant (40-69), Non-Compliant (0-39)
- risk_level: Low, Medium, or High
- List ALL specific issues found against each applicable regulation
- Give actionable recommendations with specific steps
- Cite specific laws, sections, and articles"""

        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=2000
            )
            raw = response.choices[0].message.content.strip()
            if "```" in raw:
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            result = json.loads(raw.strip())
            result["country"] = country
            result["regulation_name"] = reg_info["name"]
            result["compliance_score"] = max(0, min(100, int(result.get("compliance_score", 50))))
            total_score += result["compliance_score"]
            valid_count += 1
        except Exception as e:
            result = {
                "country": country,
                "regulation_name": reg_info["name"],
                "status": "Partially Compliant",
                "compliance_score": 50,
                "risk_level": "Medium",
                "issues": [f"Analysis error: {str(e)[:100]}"],
                "recommendations": ["Please retry the compliance check"],
                "relevant_clauses": [],
                "full_analysis": "Analysis could not be completed. Please retry.",
                "summary_one_line": "Manual review required"
            }
        all_results[country] = result

    overall_score = round(total_score / valid_count) if valid_count > 0 else 0
    non_compliant = [c for c, r in all_results.items() if r["status"] == "Non-Compliant"]
    partial = [c for c, r in all_results.items() if r["status"] == "Partially Compliant"]
    overall_status = "Non-Compliant" if non_compliant else ("Partially Compliant" if partial else "Compliant")
    overall_risk = "High" if non_compliant else ("Medium" if partial else "Low")

    return {
        "country_results": all_results,
        "overall_score": overall_score,
        "overall_status": overall_status,
        "overall_risk": overall_risk,
        "critical_issues_count": sum(len(r.get("issues", [])) for r in all_results.values()),
        "recommendations_count": sum(len(r.get("recommendations", [])) for r in all_results.values()),
        "countries_checked": countries,
        "non_compliant_countries": non_compliant,
        "partial_countries": partial
    }
