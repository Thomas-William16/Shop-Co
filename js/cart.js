const demoCart = [
  { id: 101, name: 'Gradient Graphic T-shirt', size: 'Large', color: 'White', price: 145, quantity: 1, image: '../Images/Gradient Graphic.webp' },
  { id: 102, name: 'Checkered Shirt', size: 'Medium', color: 'Red', price: 180, quantity: 1, image: '../Images/Checkered_Shirt.webp' },
  { id: 103, name: 'Skinny Fit Jeans', size: 'Large', color: 'Blue', price: 240, quantity: 1, image: '../Images/Skinny_fit_Jeans.png' }
];

document.addEventListener('DOMContentLoaded', () => {
  let cart = ShopStorage.getCart();
  if (!cart.length) { cart = demoCart; ShopStorage.setCart(cart); }
  cart = cart.map((item) => {
    const matchingDemoItem = demoCart.find((demo) => demo.name === item.name);
    return matchingDemoItem ? { ...matchingDemoItem, ...item, image: matchingDemoItem.image } : item;
  });
  const items = document.querySelector('#cart-items');
  const money = (value) => `$${value.toLocaleString()}`;
  function render() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = Math.round(subtotal * 0.2);
    const delivery = cart.length ? 15 : 0;
    const imageSource = (item) => item.image || item.images?.[0] || '';

    items.innerHTML = cart.length ? cart.map((item) => `<article class="cart-item"><div class="product-thumb">${imageSource(item) ? `<img src="${resolveProductImage(imageSource(item))}" alt="${item.name}" />` : '👕'}</div><div class="cart-item-info"><h2>${item.name}</h2><p>Size: ${item.size || 'Standard'}</p><p>Color: ${item.color || 'Classic'}</p><strong>${money(item.price)}</strong></div><div class="cart-item-actions"><button class="remove-item" data-id="${item.id}" aria-label="Remove ${item.name}">&#128465;</button><div class="quantity-control"><button data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button></div></div></article>`).join('') : '<p class="empty-cart">Your cart is empty.</p>';
    document.querySelector('#subtotal').textContent = money(subtotal);
    document.querySelector('#discount').textContent = `-${money(discount)}`;
    document.querySelector('#delivery-fee').textContent = money(delivery);
    document.querySelector('#cart-total').textContent = money(subtotal - discount + delivery);
    ShopStorage.setCart(cart); updateCartCount();
  }
  items.addEventListener('click', (event) => { const button = event.target.closest('button[data-id]'); if (!button) return; const id = Number(button.dataset.id); if (button.classList.contains('remove-item')) cart = cart.filter((item) => item.id !== id); else { const item = cart.find((entry) => entry.id === id); item.quantity += button.dataset.action === 'increase' ? 1 : -1; if (item.quantity < 1) cart = cart.filter((entry) => entry.id !== id); } render(); });
  document.querySelector('.promo-form').addEventListener('submit', (event) => event.preventDefault());
  render();
});
