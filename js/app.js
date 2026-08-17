function resolveProductImage(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http') || imagePath.startsWith('/') || imagePath.startsWith('../')) return imagePath;
  return `../${imagePath.replace(/^\.?\//, '').replace(/^images\//i, 'images/')}`;
}

function updateCartCount() {
  const count = ShopStorage.getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('#cart-count').forEach((el) => { el.textContent = count; });
}
document.addEventListener('DOMContentLoaded', updateCartCount);
