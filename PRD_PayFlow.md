# PayFlow – Product Requirement Document (PRD)

**Version:** 1.0  
**Status:** Draft  
**Author:** Product Team  
**Date:** 2025-12-16  

---

## 1. Problem Statement
Small and medium businesses (SMBs) in the digital payments space struggle with:
- **High Payment Failure Rates:** Losing revenue due to preventable technical declines or user drop-offs.
- **Opacity:** "Generic Failure" messages provide no actionable insight into why a transaction failed (e.g., Bank Downtime vs. Insufficient Funds).
- **Operational Drag:** Manual reconciliation of refunds and settlements takes significant time (T+2 or T+3 settlement cycles).
- **Lack of Optimization:** No data-driven way to route transactions dynamically to the best-performing gateway or suggest optimal payment methods.

## 2. Goals
| Goal | Description | Type |
| :--- | :--- | :--- |
| **Increase Success Rate** | Improve Transaction Success Rate (TSR) by providing transparent failure reasons and retry mechanisms. | Primary |
| **Reduce Resolution Time** | Lower Mean Time To Resolve (MTTR) for payment disputes by offering clear status logs. | Secondary |
| **Actionable Insights** | Provide SMBs with a dashboard showing real-time health of their payment stack. | Primary |
| **Developer Experience** | Offer a clean, idempotent API for easy integration. | Tech Goal |

### Non-Goals (MVP)
- Building a real banking license or acquiring network (we are a *Technical Service Provider / Payment Aggregator* simulator).
- Multi-currency support (India/INR focused for MVP).
- Hardware POS integration.

## 3. User Personas

### 1. The Merchant (Business Owner/Ops)
- **Name:** Arjun (SME Founder)
- **Pain Point:** "I don't know why my customers' payments are failing. I need to know if I should ask them to try a different card."
- **Needs:** Real-time dashboard, clear failure reasons, easy refund button.

### 2. The Product Manager (FinTech)
- **Name:** Priya (Internal PM)
- **Pain Point:** "I need data to decide which Gateway to route traffic to."
- **Needs:** Latency metrics, conversion rates per payment method.

### 3. The Engineer (Integration Dev)
- **Name:** Dev (Frontend Dev at Merchant's company)
- **Pain Point:** "The API docs are confusing and I can't test failure scenarios."
- **Needs:** Sandboxed APIs, webhooks, clear error codes.

## 4. User Journeys

### J1: Merchant Checks Daily Health
1. Arjun logs into PayFlow Dashboard.
2. Sees a drop in UPI success rate on the main chart.
3. Drills down to see "Bank Server Downtime" is the top reason.
4. Alerts his support team to ask customers to use Cards intentionally.

### J2: Developer Integrates Payment
1. Dev calls `POST /initiate-payment`.
2. receives a `payment_link`.
3. Simulates a payment failure using a test card.
4. Receives a webhook `payment.failed` with reason `INSUFFICIENT_FUNDS`.
5. Displays "Low Balance" message to user instead of generic "Error".

## 5. Feature List

### MVP (Phase 1)
- **Core Payments:** Simulate UPI (Collect/Intent) and Card (3DS) flows.
- **Merchant Dashboard:** Analytics for Success Rate, Volume, Failure Reasons.
- **Webhook Engine:** Real-time updates to merchant servers.
- **Smart Retries:** API endpoint to check if a transaction *should* be retried based on failure reason.

### Future Scope (Phase 2)
- **Dynamic Routing:** Automatically switch gateways based on real-time health.
- **Auto-Refunds:** Rule-based instant refunds for specific failure types.

## 6. Success Metrics
- **TSR (Transaction Success Rate):** % of initiated payments that are `CAPTURED`.
- **System Latency:** P95 response time for payment status webhooks.
- **Checkout Abandonment:** % of user drop-offs at the OTP/App switching stage.

## 7. Detailed User Stories

| Title | User Story | Acceptance Criteria |
| :--- | :--- | :--- |
| **View Analytics** | As a Merchant, I want to see today's TSR so I can monitor health. | Dashboard shows TSR chart filtered by Payment Method (UPI/Card). |
| **Understand Failure** | As a Merchant, I want to see exactly why a payment failed. | Transaction details show specific errors like "Bank Down", "Wrong OTP", not just "Failed". |
| **Webhook Integration** | As a Dev, I want to receive webhooks for status changes. | System posts JSON payload to registered URL on `success` or `failure`. |

## 8. Failure Scenarios & Edge Cases
- **Bank Downtime:** The acquiring bank returns 503. PayFlow should label this "Downstream Error" (Merchant not at fault).
- **Late Authorization:** Money debited but status not updated (User confused). PayFlow must support `reconcile` status.
- **Double Payment:** User pays twice for same order. PayFlow must use `Idempotency-Key` to reject the second attempt or auto-refund.
- **Network Timeout:** Gateway doesn't respond. PayFlow should treat as `PENDING` and poll for status.

## 9. Agile Roadmap
- **Sprint 1:** Core API (Init, Status) & Mock Gateway Logic.
- **Sprint 2:** Database & Webhook implementation.
- **Sprint 3:** Dashboard Frontend (React/Streamlit) & Analytics Charts.
- **Sprint 4:** Documentation, Testing, and Final Polish.
