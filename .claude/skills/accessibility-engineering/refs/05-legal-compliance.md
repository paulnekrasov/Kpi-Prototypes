# REF-05: Legal & Compliance Reference

## Standards Landscape Overview

| Standard | Jurisdiction | Applies To | Technical Basis |
|----------|-------------|-----------|----------------|
| **WCAG 2.2** | Global (W3C) | Web / mobile | Primary technical spec |
| **Section 508** | United States | Federal agencies + contractors | WCAG 2.0 Level AA |
| **ADA Title III** | United States | Places of public accommodation | WCAG 2.0/2.1 (courts) |
| **EN 301 549** | European Union | ICT products and services | WCAG 2.1 + native/mobile |
| **European Accessibility Act (EAA)** | European Union | Private digital services | EN 301 549 |
| **CVAA** | United States | Advanced communications / video | FCC rules |

---

## Section 508 (United States)

### Who Must Comply
- All US federal agencies
- Organizations that receive federal funding
- Vendors selling ICT products/services to federal agencies

### Technical Requirements
- Web and software: WCAG 2.0 Level AA (officially), with WCAG 2.1 increasingly expected
- Documents: PDF/Office accessibility
- Hardware: physical accessibility requirements
- Support services: accessible tech support

### Procurement Implications
- Vendors must provide an **Accessibility Conformance Report (ACR)** based on VPAT
- Federal buyers may reject bids without complete, current ACRs
- Compliance must cover: web, mobile apps, software, electronic content

### Section 508 Coordination
- Each agency has a Section 508 office/coordinator
- VA.gov: https://digital.va.gov/section-508/
- Section508.gov (GSA): https://www.section508.gov/

---

## ADA Title III (United States)

### Who Must Comply
- "Places of public accommodation" -- broadly interpreted to include websites and apps
- Private businesses serving the US public
- NOT currently a formal web standard (no DOJ technical specification in force as of 2024)

### Key Case Law

**Robles v. Domino's Pizza (9th Cir. 2019 + SCOTUS 2019)**
- Ninth Circuit held Domino's website and app must be accessible under ADA Title III
- Websites/apps serving as gateways to physical locations = places of public accommodation
- Court ordered compliance with WCAG 2.0
- Supreme Court declined to hear Domino's appeal -- precedent stands in 9th Circuit
- **Signal:** ADA web accessibility litigation is a real legal risk; WCAG compliance is the standard courts reference

**DOJ Guidance (2022)**
- DOJ issued guidance that the web is subject to ADA Title III
- Referenced WCAG 2.1 as appropriate technical standard
- Final formal rule issued in 2024 for state/local governments (Title II)

### ADA Compliance Posture
- Minimum: WCAG 2.1 AA conformance + documented remediation process
- Recommended: Published accessibility statement + feedback mechanism + ACR
- Risk factors: e-commerce sites, banking, healthcare, employment portals, restaurants/food delivery

---

## European Accessibility Act (EAA)

### Who Must Comply
- Private companies offering **products and services** in the EU market
- Covers: websites, mobile apps, e-commerce, banking, e-books, transport services, AV media services

### Timeline
| Date | Requirement |
|------|------------|
| June 28, 2022 | EAA entered into force |
| June 28, 2025 | **Compliance required for new products/services** |
| June 28, 2030 | Compliance required for existing (pre-2025) products/services |

### Technical Standard
- **EN 301 549 v3** -- the harmonized EU standard
- Covers web (references WCAG 2.1), mobile apps, software, hardware, kiosks
- Testing against EN 301 549 clauses maps largely to WCAG 2.1 AA + additional mobile/native requirements

### Exceptions
- Microenterprises (< 10 employees AND <= EUR 2M annual turnover) are exempt
- "Fundamental alteration" or "disproportionate burden" may be invoked (documented)

### Enforcement
- Each EU member state designates a market surveillance authority
- Non-compliance: warnings, fines, product/service withdrawal from market
- Reputational risk in EU public procurement

---

## EN 301 549 (European ICT Accessibility Standard)

### Scope
Covers all ICT products and services:
- Web content and web applications
- Mobile apps (iOS, Android)
- Desktop software
- Hardware (kiosks, ATMs, printers)
- Telecom / video products

### Structure
- **Clause 9:** Web -- maps to WCAG 2.1 Level AA (almost entirely)
- **Clause 10:** Non-web documents
- **Clause 11:** Software (native apps, desktop)
- **Clause 12:** Documentation and support services
- **Clause 13:** ICT providing relay or emergency services
- **Functional Performance Statements (FPS):** Technology-agnostic baseline requirements

### For Web and Mobile Teams
- Web: Clause 9 = WCAG 2.1 AA -- target WCAG 2.2 AA for future-proofing
- Mobile apps: Clause 11 adds native-platform requirements beyond WCAG
  - Touch target size, gesture alternatives, orientation support
  - AT compatibility (VoiceOver, TalkBack) explicitly required

---

## VPAT / ACR Documentation

### What Is a VPAT?
**Voluntary Product Accessibility Template (VPAT)** -- standard format for documenting accessibility conformance.
**Accessibility Conformance Report (ACR)** -- completed VPAT document for a specific product.

Maintained by the Information Technology Industry Council (ITI).

### VPAT Editions (v2.4)

| Edition | Covers |
|---------|--------|
| **Section 508** | US federal procurement |
| **EN 301 549** | EU compliance |
| **WCAG** | Web-only, any jurisdiction |
| **INT (International)** | All three combined -- recommended for global products |

### VPAT Conformance Levels

| Level | Meaning |
|-------|---------|
| **Supports** | Feature fully meets the criterion |
| **Partially Supports** | Feature meets the criterion in some but not all cases |
| **Does Not Support** | Feature does not meet the criterion |
| **Not Applicable** | Criterion does not apply to this product |
| **Not Evaluated** | Criterion not evaluated |

### How to Create an ACR

1. **Scope the product:** Define version, platforms, user flows tested
2. **Run tests:** Automated + manual per REF-04
3. **Map findings to VPAT criteria:** One row per SC or EN clause
4. **Write remarks:** For Partially Supports/Does Not Support -- describe the issue and remediation plan
5. **Date and version:** ACRs are dated; buyers want recent documents (< 12 months)
6. **Publish:** Provide publicly or to requesters; link from accessibility statement

### ACR Table Template (Section 508 Example)

```markdown
## Table 1: Success Criteria, Level A

| Criteria | Conformance Level | Remarks |
|----------|------------------|---------|
| 1.1.1 Non-text Content | Supports | All images have alt text or role="presentation" |
| 1.3.1 Info and Relationships | Partially Supports | Some legacy tables lack header associations -- fix scheduled Q3 2025 |
| 2.1.1 Keyboard | Supports | All interactive elements keyboard accessible |
| 4.1.2 Name, Role, Value | Does Not Support | Custom dropdown lacks ARIA roles -- known issue, remediation in progress |
```

---

## Accessibility Statement (Best Practice)

Publish a publicly accessible Accessibility Statement that includes:

```markdown
## Accessibility Statement for [Product Name]

### Conformance Status
This product aims to conform to WCAG 2.2 Level AA.

### Known Limitations
- [Specific issue]: [workaround / fix date]

### Feedback and Contact
Contact us to report accessibility barriers:
Email: accessibility@company.com
Response time: 2 business days

### Technical Specifications
- HTML5, CSS3, WAI-ARIA 1.2
- Tested with: NVDA + Firefox, VoiceOver + Safari, axe DevTools

### Assessment Approach
Self-evaluated + [Third-party audit by X, date]
```

---

## Legal Risk Matrix

| Risk Level | Situation | Recommended Action |
|-----------|-----------|-------------------|
| **High** | US e-commerce, banking, healthcare, food delivery | WCAG 2.1 AA + ACR + accessibility statement + feedback channel |
| **High** | EU digital services launching/updating post June 2025 | EN 301 549 / WCAG 2.2 + EAA compliance plan |
| **Medium** | US enterprise software with government clients | Section 508 ACR required for procurement |
| **Medium** | Global SaaS with EU customers | EAA due diligence + WCAG 2.2 AA target |
| **Lower** | Internal tools, no public access | WCAG AA as best practice; legal risk lower but team inclusion matters |

---

## Sources
- Section508.gov: https://www.section508.gov/
- EAA Official Text: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0882
- EN 301 549: https://www.etsi.org/deliver/etsi_en/301500_302000/301549/
- VPAT Templates: https://www.itic.org/policy/accessibility/vpat
- Robles v. Domino's: https://www.seyfarth.com/news-insights/court-finds-dominos-pizza-violated-ada
- WebAIM Million Report (2024): https://webaim.org/projects/million/