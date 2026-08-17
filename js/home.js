document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetch('../data/products.json').then((response) => {
    if (!response.ok) throw new Error('Failed to load products');
    return response.json();
  });

  const list = document.querySelector('#product-list');
  if (!list) return;

  list.innerHTML = products.map((product) => `
    <article class="product-card">
      <a href="product.html?id=${product.id}">
        <img src="${resolveProductImage(product.images?.[0])}" alt="${product.name}" />
        <div class="product-meta">
          <h2>${product.name}</h2>
          <p class="price">$${product.price}</p>
        </div>
      </a>
    </article>
  `).join('');
});
