/* ============================================================
   cart.html logic — depends on script.js (getCartItems, setCartItems, money)
   ============================================================ */

(function initCartPage() {
  const itemsBox = document.getElementById("cart-items");
  const promoForm = document.getElementById("promo-form");

  let cart = getCartItems();
  let promoApplied = false; // the 20% line only shows once a promo code is applied

  function render() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = promoApplied ? Math.round(subtotal * 0.2) : 0;
    const delivery = cart.length ? 15 : 0;

    itemsBox.innerHTML = cart.length
      ? cart.map(item => `
        <article class="cart-item">
          <div class="product-thumb">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-info">
            <h2>${item.name}</h2>
            <p>Size: ${item.size || "Standard"}</p>
            <p>Color: ${item.color || "Classic"}</p>
            <strong>${money(item.price)}</strong>
          </div>
          <div class="cart-item-actions">
            <button class="remove-item" data-line="${item.id}|${item.size}|${item.color}" aria-label="Remove ${item.name}">🗑</button>
            <div class="quantity-control">
              <button data-action="decrease" data-line="${item.id}|${item.size}|${item.color}" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button data-action="increase" data-line="${item.id}|${item.size}|${item.color}" aria-label="Increase quantity">+</button>
            </div>
          </div>
        </article>`).join("")
      : `<p class="empty-cart">Your cart is empty. <a href="shop.html">Continue shopping →</a></p>`;

    document.getElementById("subtotal").textContent = money(subtotal);
    document.getElementById("discount").textContent = `-${money(discount)}`;
    document.getElementById("delivery-fee").textContent = money(delivery);
    document.getElementById("cart-total").textContent = money(subtotal - discount + delivery);

    setCartItems(cart); // also refreshes the header badge
  }

  itemsBox.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-line]");
    if (!btn) return;
    const [id, size, color] = btn.dataset.line.split("|");
    const match = item => item.id === Number(id) && item.size === size && item.color === color;

    if (btn.classList.contains("remove-item")) {
      cart = cart.filter(item => !match(item));
    } else {
      const item = cart.find(match);
      item.quantity += btn.dataset.action === "increase" ? 1 : -1;
      if (item.quantity < 1) cart = cart.filter(entry => !match(entry));
    }
    render();
  });

  promoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = promoForm.querySelector("input");
    if (input.value.trim()) {
      promoApplied = true;
      input.value = "";
      input.placeholder = "Promo applied ✓";
      render();
    }
  });

  document.getElementById("checkout-btn").addEventListener("click", () => {
    if (!cart.length) return;
    alert("Checkout isn't wired up yet — this is where you'd send the shopper to payment.");
  });

  render();
})();
