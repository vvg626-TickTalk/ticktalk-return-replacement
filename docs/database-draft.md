# Database draft (early planning)

Lightweight sketch of **possible** backend entities for TickTalk Service Portal—**not** a final schema. Relationships are indicative; omit detailed indexes and auditing here.

---

## Customer

| Field | Type (conceptual) | Notes |
|-------|-------------------|--------|
| id | UUID | |
| email | string, nullable | Unique when present |
| phone_e164 | string, nullable | Unique when present |
| created_at | timestamp | |

---

## Order (sales order)

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | Internal |
| channel | enum | amazon, walmart, bestbuy, myticktalk, … |
| external_order_ref | string | Retailer-facing id |
| shipping_postal | string | Used in lookup validation |
| customer_id | FK → Customer, nullable | Populated after registration/login |
| created_at | timestamp | |

---

## OrderLine

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | |
| order_id | FK | |
| product_id | FK → Product | |
| quantity | int | |
| imei | string, nullable | Hidden until shipped / rules |
| status | enum | e.g. unshipped, shipped, cancelled |
| is_gift | bool | Governs bundle return rules |
| parent_bundle_id | UUID, nullable | Links main + gift |

---

## Product

| Field | Type | Notes |
|-------|------|--------|
| id | UUID / SKU | |
| name | string | |
| kind | enum | watch, accessory, bundle_component |
| generation | string, nullable | e.g. TT5 |

---

## IMEI (optional normalization)

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | |
| value | string | Unique |
| product_id | FK | |
| order_line_id | FK | |
| verified_at | timestamp, nullable | |

*Alternatively* keep IMEI only on `OrderLine` if no shared device registry is needed yet.

---

## Warranty

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | |
| order_line_id | FK | |
| starts_on / ends_on | date | Derived from ship/activation TBD |
| tier | enum | standard, care_plus |

---

## Care+ Subscription

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | |
| account_ref | string | Parent purchaser account identifier |
| device_phone | string | Watch phone number |
| status | enum | active, lapsed |
| expires_on | date, nullable | |

---

## Verification Session

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | |
| customer_id | FK | |
| order_id | FK | |
| type | enum | care_plus |
| status | enum | pending, verified, failed |
| sent_count | int | Rate-limit tracking |
| verified_at | timestamp, nullable | |

---

## RMA

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | |
| code | string | Customer-visible |
| order_id | FK | Deck: bind to order |
| kind | enum | return, replacement, trade_in |
| status | enum | maps to deck statuses |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## Return Request

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | |
| rma_id | FK | 1:1 with RMA of kind `return` |
| refund_total_cents | int, nullable | Preview estimate |
| shipping_label_url | string, nullable | |

---

## Replacement Request

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | |
| rma_id | FK | 1:1 with RMA of kind `replacement` |
| replacement_product_id | FK | May differ (color/gen swap) |
| restock_hold | bool | “Wait for restock” path |

---

## Trade-in Request

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | |
| rma_id | FK, nullable | Might attach to checkout order instead |
| brand | string | |
| quoted_value_cents | int | |
| imei | string, nullable | TickTalk devices |
| state | enum | quoted, applied, cancelled | |

---

## Shipment

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | |
| rma_id | FK | |
| direction | enum | inbound, outbound |
| carrier | string | |
| tracking | string | |
| status | enum | |

---

## Inventory (minimal)

| Field | Type | Notes |
|-------|------|--------|
| product_id | FK | |
| color | string | |
| on_hand | int | |
| allow_waitlist | bool | |

---

## Relationship sketch (text)

```
Customer 1—* Order *—* OrderLine *—1 Product
OrderLine 0—1 Warranty
OrderLine 0—* IMEI (optional)
Customer 1—* VerificationSession *—1 Order (typical)
Order 1—* RMA
RMA 1—0..1 ReturnRequest | ReplacementRequest | TradeInRequest
RMA *—* Shipment
```

---

## Non-goals (for this draft)

- Full audit tables, soft deletes, localized copy tables, and CMS bridges.
- Payment capture / refund ledger—treat as downstream finance service.

---

## Revision history

| Date | Note |
|------|------|
| 2026-05-18 | Initial brainstorming draft. |
