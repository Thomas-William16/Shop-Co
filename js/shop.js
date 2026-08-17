document.addEventListener('DOMContentLoaded', async () => {
  const list = document.querySelector('#product-list');
  try {
    const response = await fetch('../data/products.json');
    if (!response.ok) throw new Error('Unable to load products.');
    const products = await response.json();
    document.querySelector('#product-count').textContent = `${products.length} items`;
    list.innerHTML = products.map((product) => `<article class="shop-card"><a class="shop-card-image" href="product.html?id=${product.id}"><img src="${resolveProductImage(product.images?.[0])}" alt="${product.name}" /></a><h2><a href="product.html?id=${product.id}">${product.name}</a></h2><p class="shop-rating">${'★'.repeat(Math.round(product.rating || 0))}${'☆'.repeat(5 - Math.round(product.rating || 0))} <span>${product.rating || 0}/5</span></p><div class="shop-pricing"><span class="shop-price">$${product.price}</span>${product.originalPrice > product.price ? `<span class="shop-old-price">$${product.originalPrice}</span>` : ''}${product.discount ? `<span class="shop-discount">-${product.discount}%</span>` : ''}</div></article>`).join('');
  } catch (error) { list.innerHTML = `<p>${error.message}</p>`; }
});
