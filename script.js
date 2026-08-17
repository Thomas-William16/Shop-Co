/* ============================================================
   SHOP.CO — shared helpers used by every page
   ============================================================ */

/** Fetch the product catalog from products.json */
async function loadProducts() {
  const res = await fetch("products.json");
  if (!res.ok) throw new Error("Could not load products.json");
  return res.json();
}

/** Build a star-rating string, e.g. 4.5 -> "★★★★☆" */
function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/** Format a price as $123 */
function money(n) {
  return `$${n}`;
}

/** Build the inner HTML for one product card */
function productCardHTML(p) {
  const badge = p.tags && p.tags.includes("new-arrival")
    ? '<span class="product-badge">New</span>'
    : "";
  return `
    <div class="product-card" data-id="${p.id}">
      <a class="product-card-link" href="product.html?id=${p.id}">
        <div class="product-thumb">
          ${badge}
          <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
        </div>
        <p class="product-name">${p.name}</p>
        <div class="product-rating">
          <span class="stars">${starString(p.rating)}</span>
          <span>${p.rating}/5</span>
        </div>
        <div class="product-price">
          <span>${money(p.price)}</span>
          ${p.discount > 0 ? `<span class="old">${money(p.originalPrice)}</span><span class="discount">-${p.discount}%</span>` : ""}
        </div>
      </a>
      <button
        class="btn btn-primary add-to-cart-btn"
        data-add-to-cart
        data-id="${p.id}"
        data-name="${p.name}"
        data-price="${p.price}"
        data-image="${p.images[0]}"
        data-size="${p.sizes[0] || ""}"
        data-color="${p.colors[0] || ""}">
        Add to Bag
      </button>
    </div>`;
}

/** Render a list of products into a container element */
function renderProducts(container, products) {
  if (!products.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No products match those filters.</p>
        <button class="btn btn-outline" id="empty-reset">Clear filters</button>
      </div>`;
    return;
  }
  container.innerHTML = products.map(productCardHTML).join("");
}

/* ============================================================
   Cart storage — a single localStorage-backed array of line items,
   shared by every page (header badge + cart.html)
   ============================================================ */

const CART_ITEMS_KEY = "shopco_cart_items";

/** Read the full cart (array of {id, name, price, image, size, color, quantity}) */
function getCartItems() {
  try {
    return JSON.parse(localStorage.getItem(CART_ITEMS_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Persist the full cart and refresh every cart-count badge on the page */
function setCartItems(items) {
  localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));
  updateCartCountBadge();
}

/** Sum of quantities across all line items, shown in the header badge */
function updateCartCountBadge() {
  const total = getCartItems().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach(el => (el.textContent = total));
}

/**
 * Add a product to the cart. Matches an existing line by id + size + color
 * and bumps its quantity, otherwise adds a new line.
 */
function addToCart({ id, name, price, image, size, color }) {
  const items = getCartItems();
  const existing = items.find(i => i.id === id && i.size === size && i.color === color);
  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({ id, name, price: Number(price), image, size, color, quantity: 1 });
  }
  setCartItems(items);
}

/** Wire up "Add to bag" buttons anywhere on the page: [data-add-to-cart] */
function initCartBadge() {
  updateCartCountBadge();
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-to-cart]");
    if (btn) {
      e.preventDefault();
      addToCart({
        id: Number(btn.dataset.id),
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        image: btn.dataset.image,
        size: btn.dataset.size,
        color: btn.dataset.color,
      });
      const original = btn.textContent;
      btn.textContent = "Added ✓";
      setTimeout(() => { btn.textContent = original; }, 900);
    }
  });
}

/** Populate the newsletter form on any page (prevents real submission) */
function initNewsletterForm() {
  const form = document.querySelector(".newsletter-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    if (input.value.trim()) {
      input.value = "";
      input.placeholder = "Subscribed! Thanks 🎉";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initCartBadge();
  initNewsletterForm();
});
