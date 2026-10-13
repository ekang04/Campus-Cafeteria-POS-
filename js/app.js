// Campus Cafeteria POS — main application logic.
// All data is kept in memory (no database, no API).

// ===== State =====
let cart = []; // items: { id, name, price, qty }

// ===== Helpers =====
// Work in centavos to avoid floating-point errors (e.g. 0.1 + 0.2).
const toCents = (amount) => Math.round(amount * 100);
const fromCents = (cents) => cents / 100;

function peso(amount) {
  return "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const $ = (id) => document.getElementById(id);

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
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
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

// ===== Rendering =====
function renderProducts() {
  $("product-grid").innerHTML = PRODUCTS.map((p) => `
    <div class="product">
      <div class="product-icon">${p.icon}</div>
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
      <div class="cart-item">
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

  const count = getItemCount();
  $("cart-count").textContent = `${count} item${count === 1 ? "" : "s"}`;
  $("cart-total").textContent = peso(getTotal());
  $("btn-proceed").disabled = cart.length === 0;
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
  if (btn.dataset.action === "inc") changeQty(id, 1);
  if (btn.dataset.action === "dec") changeQty(id, -1);
  if (btn.dataset.action === "remove") removeItem(id);
});

$("btn-clear").addEventListener("click", () => {
  if (cart.length === 0) return;
  clearCart();
  toast("Order cleared");
});

// ===== Start =====
renderProducts();
renderCart();
