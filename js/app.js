// Campus Cafeteria POS — main application logic.
// All data is kept in memory (no database, no API).

// ===== Helpers =====
function peso(amount) {
  return "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const $ = (id) => document.getElementById(id);

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

renderProducts();
