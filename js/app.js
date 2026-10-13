// Campus Cafeteria POS — main application logic.
// All data is kept in memory (no database, no API).

// ===== State =====
let cart = [];              // items: { id, name, price, qty }
let lastTransaction = null; // filled after a successful payment
let txnCounter = 0;         // increments for every completed transaction
let lastChange = null;      // { id, type: "new" | "qty" } — tells renderCart which row to animate
let isProcessing = false;   // true while the payment window is open (blocks double submit)

// How long each phase of the payment window stays on screen (milliseconds).
const PROCESSING_MS = 1500;
const CONFIRM_MS = 1500;

// ===== Helpers =====
// Work in centavos to avoid floating-point errors (e.g. 0.1 + 0.2).
const toCents = (amount) => Math.round(amount * 100);
const fromCents = (cents) => cents / 100;

function peso(amount) {
  return "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const $ = (id) => document.getElementById(id);

// Restart a CSS animation class (remove it, force a reflow, add it back).
function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function toast(message, type = "success") {
  const el = document.createElement("div");
  el.className = "toast" + (type === "error" ? " error" : "");
  el.textContent = message;
  $("toast-area").appendChild(el);
  setTimeout(() => el.classList.add("hide"), 2200);
  setTimeout(() => el.remove(), 2500);
}

// ===== Cart logic =====
function addToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.qty++;
    lastChange = { id, type: "qty" };
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    lastChange = { id, type: "new" };
  }
  renderCart();
  toast(`Added ${product.name} to order`);
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeItem(id);
    return;
  }
  lastChange = { id, type: "qty" };
  renderCart();
}

function removeItem(id) {
  const item = cart.find((i) => i.id === id);
  cart = cart.filter((i) => i.id !== id);
  renderCart();
  if (item) toast(`Removed ${item.name}`);
}

function clearCart() {
  cart = [];
  renderCart();
}

function getSubtotal(item) {
  return fromCents(toCents(item.price) * item.qty);
}

function getTotal() {
  return fromCents(cart.reduce((sum, i) => sum + toCents(i.price) * i.qty, 0));
}

// Change = Amount Paid − Total Amount
function computeChange(amountPaid, total) {
  return fromCents(toCents(amountPaid) - toCents(total));
}

function getItemCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

// ===== Payment validation =====
// Returns { ok: true, amount } or { ok: false, message }.
function validatePayment(raw, total) {
  const value = raw.trim();
  const invalid = { ok: false, message: "Please enter a valid payment amount." };

  if (value === "") return invalid;                          // blank
  if (value.startsWith("-")) return invalid;                 // negative
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return invalid;      // non-numeric / bad format

  const amount = parseFloat(value);
  if (amount <= 0) return invalid;                           // zero

  if (toCents(amount) < toCents(total)) {
    return { ok: false, message: `Insufficient payment. Please enter at least ${peso(total)}.` };
  }
  return { ok: true, amount };
}

// ===== Stage navigation =====
function showStage(step) {
  $("stage-order").hidden = step !== 1;
  $("stage-payment").hidden = step !== 2;
  $("stage-receipt").hidden = step !== 3;

  document.querySelectorAll("#stepper .step").forEach((el) => {
    const n = Number(el.dataset.step);
    el.classList.toggle("active", n === step);
    el.classList.toggle("done", n < step);
  });
  window.scrollTo(0, 0);
}

function goToPayment() {
  if (cart.length === 0) return;
  renderSummary();
  resetPaymentForm();
  showStage(2);
  $("cash-input").focus();
}

function confirmPayment() {
  if (isProcessing) return; // ignore extra clicks / Enter while processing

  const total = getTotal();
  const result = validatePayment($("cash-input").value, total);

  if (!result.ok) {
    showPaymentError(result.message);
    toast(result.message, "error");
    $("cash-input").focus();
    return;
  }

  txnCounter++;
  const now = new Date();
  lastTransaction = {
    ref: makeReference(now, txnCounter),
    date: now,
    items: cart.map((i) => ({ ...i })),
    total,
    paid: result.amount,
    change: computeChange(result.amount, total),
    status: "PAID"
  };

  showProcessing(lastTransaction);
}

// Payment window: "Processing…" → "Payment Confirmed" summary → receipt.
function showProcessing(t) {
  isProcessing = true;

  // Phase 1: processing
  $("proc-amounts").textContent = `Cash ${peso(t.paid)} · Total ${peso(t.total)}`;
  $("proc-loading").hidden = false;
  $("proc-done").hidden = true;
  $("processing").hidden = false;

  setTimeout(() => {
    // Phase 2: confirmed, with transaction details
    $("proc-summary").innerHTML = `
      <dt>Reference No.</dt><dd>${t.ref}</dd>
      <dt>Total Amount</dt><dd>${peso(t.total)}</dd>
      <dt>Cash Received</dt><dd>${peso(t.paid)}</dd>
      <dt>Change</dt><dd class="proc-change">${peso(t.change)}</dd>
    `;
    $("proc-loading").hidden = true;
    $("proc-done").hidden = false;
    $("proc-bar").style.animationDuration = CONFIRM_MS + "ms";

    setTimeout(() => {
      // Done: show the receipt
      $("processing").hidden = true;
      renderReceipt(t);
      showStage(3);
      toast("Payment successful");
      isProcessing = false;
    }, CONFIRM_MS);
  }, PROCESSING_MS);
}

function startNewTransaction() {
  cart = [];
  lastTransaction = null;
  resetPaymentForm();
  $("receipt").innerHTML = "";
  renderCart();
  showStage(1);
  toast("Ready for a new transaction");
}

// Reference format: TXN-YYYYMMDD-0001
function makeReference(date, counter) {
  const ymd = date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");
  return `TXN-${ymd}-${String(counter).padStart(4, "0")}`;
}

// ===== Rendering =====
function renderProducts() {
  $("product-grid").innerHTML = PRODUCTS.map((p, index) => `
    <div class="product" style="--i:${index}">
      <div class="product-thumb">
        ${p.image
          ? `<img src="${p.image}" alt="${p.name}"
                  class="${p.fit === "contain" ? "fit-contain" : ""}"
                  style="object-position: ${p.focus || "center"}">`
          : `<span class="product-icon">${p.icon}</span>`}
      </div>
      <span class="product-cat">${p.category}</span>
      <span class="product-name">${p.name}</span>
      <span class="product-price">${peso(p.price)}</span>
      <button class="btn btn-primary" type="button" data-id="${p.id}">+ Add to Order</button>
    </div>
  `).join("");
}

function renderCart() {
  const list = $("cart-list");

  if (cart.length === 0) {
    list.innerHTML = `<div class="cart-empty">No items yet.<br>Add products from the menu.</div>`;
  } else {
    list.innerHTML = cart.map((i) => `
      <div class="cart-item ${animClass(i.id)}" data-row="${i.id}">
        <div>
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-price">${peso(i.price)} each</div>
        </div>
        <div class="cart-item-sub">${peso(getSubtotal(i))}</div>
        <div class="cart-controls">
          <button class="qty-btn" type="button" data-action="dec" data-id="${i.id}" aria-label="Decrease quantity">−</button>
          <span class="qty-val">${i.qty}</span>
          <button class="qty-btn" type="button" data-action="inc" data-id="${i.id}" aria-label="Increase quantity">+</button>
        </div>
        <button class="remove-btn" type="button" data-action="remove" data-id="${i.id}">Remove</button>
      </div>
    `).join("");
  }

  lastChange = null;

  const count = getItemCount();
  $("cart-count").textContent = `${count} item${count === 1 ? "" : "s"}`;

  const totalEl = $("cart-total");
  const newTotal = peso(getTotal());
  if (totalEl.textContent !== newTotal) {
    totalEl.textContent = newTotal;
    replay(totalEl, "pulse");
  }
  $("btn-proceed").disabled = cart.length === 0;
}

// Animation class for a cart row: slide in when new, bump when its quantity changed.
function animClass(id) {
  if (!lastChange || lastChange.id !== id) return "";
  return lastChange.type === "new" ? "is-new" : "bumped";
}

// Fade the row out first, then remove it from the cart.
function animateRemove(id) {
  const row = document.querySelector(`[data-row="${id}"]`);
  if (!row || row.classList.contains("removing")) return;
  row.classList.add("removing");
  setTimeout(() => removeItem(id), 200);
}

function itemRows(items) {
  return items.map((i, index) => `
    <tr class="row-in" style="--i:${index}">
      <td>${i.name}</td>
      <td class="num">${i.qty}</td>
      <td class="num">${peso(i.price)}</td>
      <td class="num">${peso(getSubtotal(i))}</td>
    </tr>
  `).join("");
}

function renderSummary() {
  $("summary-body").innerHTML = itemRows(cart);
  $("pay-total").textContent = peso(getTotal());
}

function resetPaymentForm() {
  $("cash-input").value = "";
  $("change-preview").textContent = peso(0);
  clearPaymentError();
}

function showPaymentError(message) {
  $("pay-error").textContent = message;
  replay($("pay-error"), "fade-in");
  $("cash-input").parentElement.classList.add("invalid");
  replay($("cash-input").parentElement, "shake");
}

function clearPaymentError() {
  $("pay-error").textContent = "";
  $("cash-input").parentElement.classList.remove("invalid");
}

// Live change preview while the cashier types.
function updateChangePreview() {
  clearPaymentError();
  const result = validatePayment($("cash-input").value, getTotal());
  const changeEl = $("change-preview");
  const newChange = result.ok ? peso(computeChange(result.amount, getTotal())) : peso(0);
  if (changeEl.textContent !== newChange) {
    changeEl.textContent = newChange;
    if (result.ok) replay(changeEl.parentElement, "pulse");
  }
}

function renderReceipt(t) {
  const dateText = t.date.toLocaleString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  $("receipt").innerHTML = `
    <div class="receipt-head">
      <h3>Campus Cafeteria</h3>
      <p>Davao del Norte State College</p>
      <p>Official Digital Receipt</p>
    </div>
    <dl class="receipt-meta">
      <dt>Reference No.</dt><dd>${t.ref}</dd>
      <dt>Date &amp; Time</dt><dd>${dateText}</dd>
      <dt>Payment Method</dt><dd>Cash</dd>
      <dt>Status</dt><dd><span class="status-paid">${t.status}</span></dd>
    </dl>
    <table class="table">
      <thead>
        <tr><th>Item</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Subtotal</th></tr>
      </thead>
      <tbody>${itemRows(t.items)}</tbody>
    </table>
    <div class="receipt-totals">
      <div class="grand"><span>Total Amount</span><span>${peso(t.total)}</span></div>
      <div><span>Cash Received</span><span>${peso(t.paid)}</span></div>
      <div><span>Change</span><strong>${peso(t.change)}</strong></div>
    </div>
    <div class="receipt-foot">Thank you for dining with us!</div>
  `;
}

// ===== Events =====
$("product-grid").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (btn) addToCart(Number(btn.dataset.id));
});

$("cart-list").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const item = cart.find((i) => i.id === id);
  if (btn.dataset.action === "inc") changeQty(id, 1);
  if (btn.dataset.action === "dec") {
    if (item && item.qty === 1) animateRemove(id); // last one: fade out, then remove
    else changeQty(id, -1);
  }
  if (btn.dataset.action === "remove") animateRemove(id);
});

$("btn-clear").addEventListener("click", () => {
  if (cart.length === 0) return;
  clearCart();
  toast("Order cleared");
});

$("btn-proceed").addEventListener("click", goToPayment);
$("btn-back").addEventListener("click", () => showStage(1));
$("btn-confirm").addEventListener("click", confirmPayment);
$("btn-new").addEventListener("click", startNewTransaction);
$("btn-print").addEventListener("click", () => window.print());

$("cash-input").addEventListener("input", updateChangePreview);
$("cash-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") confirmPayment();
});

$("quick-cash").addEventListener("click", (e) => {
  const chip = e.target.closest("button[data-amount]");
  if (!chip) return;
  const amount = chip.dataset.amount === "exact" ? getTotal() : Number(chip.dataset.amount);
  $("cash-input").value = amount.toFixed(2);
  updateChangePreview();
  $("cash-input").focus();
});

// ===== Start =====
renderProducts();
renderCart();
