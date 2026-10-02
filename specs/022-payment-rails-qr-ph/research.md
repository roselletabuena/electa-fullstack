# Research & Technical Decisions: Philippine Payment Rails & Dynamic QR Ph (VS-21)

## 1. Gateway Provider Evaluation

| Provider            | Strengths                                                                                                                                       | Limitations                                 | Decision                     |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ | :--------------------------- |
| **PayMongo**        | Direct support for Philippine Dynamic QR Ph (EMVCo), GCash native, Maya native, GrabPay, Credit/Debit cards. High developer ergonomic REST API. | Requires webhook endpoint in production.    | **Selected Primary Gateway** |
| **Xendit PH**       | Strong Southeast Asian coverage, dynamic QR.                                                                                                    | Higher onboarding friction for local tests. | Secondary fallback           |
| **Local Simulator** | Zero-latency local development, simulated webhook trigger, instant receipt testing.                                                             | Local development only.                     | **Selected Dev Harness**     |

## 2. Dynamic QR Ph Technical Mechanics (EMVCo standard)

- Standard Philippine QR Ph follows EMVCo Merchant-Presented QR Code Specification (Payload format indicator `00`, Point of Initiation `01=12` for dynamic, Merchant Account Info `28` for Philippine National QR Network).
- PayMongo creates a `payment_intent` and attaches a `source` or `payment_method` of type `qrph` or `gcash`, returning a raw QR string or image URL.
- On client side, `qrcode` library renders high-contrast sharp SVGs with zero edge rounding.

## 3. Webhook Security & Idempotency Architecture

- PayMongo uses HMAC SHA-256 signatures passed via `Paymongo-Signature` header (`t=timestamp,te=test_signature,li=live_signature`).
- Database updates run inside `prisma.$transaction` with row-level integrity to prevent duplicate vote increments even if webhooks retry simultaneously.
