# AI-Assisted Development Documentation

**Tool used:** Claude Code (Claude Opus 5.5) in Visual Studio Code

> Fill in or adjust each entry so it reflects what you actually did, evaluated, and changed.
> You must be able to explain every part of the code during checking.

---

## Entry 1 — Building the system

**Prompt used:**
> Hi, we are making an activity, and we are asked to do 1 scenario and we need to make a system based on that scenario.
> *(followed by the full "Campus Cafeteria Point-of-Sale (POS) System" concept: system overview, HTML/CSS/vanilla JS only, no database/API/login, three-step process — Product Ordering, Cash Payment, Digital Receipt — the product list, and the recommended project structure)*

**Purpose of the prompt:**
Generate the initial project structure and the core POS features for Scenario 1 (product menu, cart, totals, payment validation, change computation, receipt, new transaction).

**AI response (summary):**
The AI first proposed a plan, then created `index.html`, `css/style.css`, `js/products.js`, `js/app.js`, the favicon, and the README in stages, making one Git commit per stage. It used centavo-based arithmetic for money and a text input with a regex validator for the cash amount.

**My evaluation:** *(correct / partially correct / incorrect — and why)*
_Example: Correct. I tested the worked example (2 Fried Chicken, 1 Rice, 1 Iced Tea = ₱165.00; paid ₱200.00, change ₱35.00) and the validation cases (blank, "abc", "-5", "0", "100")._

**Modifications I made:**
_Write what you changed, e.g. colors, labels, product icons, or messages._

---

## Entry 2 — Debugging / refactoring

**Prompt used:**
> _Write the exact prompt, e.g. "Why does my total show 0.30000000000000004 when I add items?" or "Explain how validatePayment() works and check if it rejects all invalid inputs."_

**Purpose of the prompt:**
_e.g. Debug a floating-point issue in totals / verify the validation logic._

**AI response (summary):**
_Summarize what the AI answered or changed._

**My evaluation:**
_Correct / partially correct / incorrect, and why._

**Modifications I made:**
_What you adjusted before using it._
