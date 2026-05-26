# Risk Rubric

ClearUse AI uses an operational risk score to help small IT teams decide how an
AI tool can be used. The score is not legal advice and should be reviewed by a
human before a tool is approved.

## Score Bands

| Score | Level | Recommended status |
|-------|-------|--------------------|
| 0-24 | Low | Approved |
| 25-49 | Medium | Restricted |
| 50-74 | High | Under Review |
| 75-100 | Critical | Blocked |

## Factors

The rubric adds risk for sensitive data types, unclear model-training terms,
unclear retention, missing SSO, missing audit logs, missing admin controls,
unclear deletion support, unclear terms, high business criticality, and broad
user rollout.

The rubric reduces risk when use is limited to public data, SSO is available,
compliance claims are documented, and sensitive-data handling is documented.

## Review Principle

Unknown answers are intentionally risky. A vendor that does not clearly document
model training, retention, controls, or sensitive-data handling should not be
broadly approved until the missing information is resolved.
