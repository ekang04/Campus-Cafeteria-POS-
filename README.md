# Campus Cafeteria POS

A computer-based food ordering and point-of-sale (POS) system for a walk-up campus cafeteria counter,
where student assistants take lunch orders for rice meals, viands, snacks, and drinks.

**IT 415 — Application Development and Emerging Technologies · Midterm Practical Examination · Scenario 1**

## Technologies
- HTML5 (structure)
- CSS3 (layout and design)
- Vanilla JavaScript (functionality)

No database, API, backend, or login. Products are hard-coded, and cart and transaction data stay in browser memory.

## How to Run
1. Download or clone this repository.
2. Open `index.html` in any modern web browser (Chrome, Edge, Firefox).

No installation or server is needed.

## Transaction Flow
| Step | Screen | What happens |
|---|---|---|
| 1 | **Order** | Browse the menu, add products, adjust quantities, remove items. Subtotals and the total update automatically. |
| 2 | **Payment** | Review the order summary, type the cash amount, and confirm. The system validates the amount and computes the change. |
| 3 | **Receipt** | The payment confirmation and digital receipt appear. **New Transaction** clears everything. |

## Features
- 6 cafeteria products with names and prices
- Add to Order buttons, + / − quantity controls, Remove, and Clear
- Automatic subtotal and total computation
- **Proceed to Payment** is enabled only when the cart has items
- Cash payment input with validation:
  - Blank, non-numeric, negative, or zero → *"Please enter a valid payment amount."*
  - Less than the total → *"Insufficient payment. Please enter at least ₱X.XX."*
- Change computation: `Change = Amount Paid − Total Amount`
- Live change preview, quick-cash buttons, and Enter key to confirm
- Back to Order without losing the cart
- Digital receipt: reference number (`TXN-YYYYMMDD-0001`), date and time, items, quantities, unit prices, subtotals, total, cash received, change, and status
- Print receipt
- New Transaction resets the cart, payment, and receipt

## Menu
| Product | Price |
|---|---|
| Rice (Plain) | ₱15.00 |
| Fried Chicken (1 pc) | ₱65.00 |
| Pork Adobo | ₱60.00 |
| Vegetable Side Dish | ₱35.00 |
| Iced Tea (cup) | ₱20.00 |
| Bottled Water | ₱20.00 |

## Worked Example
2 × Fried Chicken + 1 × Rice + 1 × Iced Tea = **₱165.00**. Paying ₱200.00 gives a change of **₱35.00**.

## Project Structure
```
├── index.html          Page layout (Order, Payment, Receipt sections)
├── css/style.css       Styles
├── js/products.js      Hard-coded product list
├── js/app.js           Cart, computation, validation, receipt logic
├── assets/favicon.svg  App icon
├── docs/ai-usage.md    AI-assisted development documentation
└── README.md
```

## Notes on the Code
- Money is computed in centavos (`Math.round(amount * 100)`) to avoid floating-point errors such as `0.1 + 0.2 = 0.30000000000000004`.
- The cash field is a text input with `inputmode="decimal"` so that non-numeric entries reach the validator and show the error message, instead of being silently blanked by the browser.
