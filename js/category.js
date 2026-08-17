document.addEventListener('DOMContentLoaded', async () => {
  const target = document.querySelector('#category-detail');
  const products = await fetch('../data/products.json').then((response) => response.json());
  const product = products.find((item) => item.name === 'Courage Graphic T-shirt') || products[0];
  const related = products.filter((item) => item.id !== product.id).slice(0, 4);
  const image = resolveProductImage(product.images?.[0]);
  const reviewStorageKey = 'shop-co-reviews';
  const savedReviews = JSON.parse(localStorage.getItem(reviewStorageKey) || localStorage.getItem('shop-co-category-reviews') || '[]');
  const allReviews = [...savedReviews, ...reviews];
  let quantity = 1;

  target.innerHTML = `
    <p class="product-breadcrumb">Home <span>›</span> Shop <span>›</span> Men <span>›</span> T-shirts</p>
    <section class="product-main">
      <div class="product-gallery"><div class="product-thumb-list">${[1, 2, 3].map((index) => `<button type="button" class="${index === 1 ? 'active' : ''}" data-image="${image}"><img src="${image}" alt="${product.name} view ${index}" /></button>`).join('')}</div><div class="product-main-visual"><img id="main-product-image" src="${image}" alt="${product.name}" /></div></div>
      <div class="product-info"><h1 class="product-title">ONE LIFE GRAPHIC T-SHIRT</h1><div class="rating-row"><span class="stars">★ ★ ★ ★ ★</span><span class="rating-score">4.5/5</span></div><div class="product-price-row"><span class="product-price">$260</span><span class="product-old-price">$300</span><span class="product-discount">-40%</span></div><p class="product-description">This graphic T-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.</p><hr /><div><span class="product-label">Select Colors</span><div class="swatches"><button class="swatch active" style="background:#4c4a3b" aria-label="Olive"></button><button class="swatch" style="background:#314a4d" aria-label="Teal"></button><button class="swatch" style="background:#2f3453" aria-label="Navy"></button></div></div><hr /><div><span class="product-label">Choose Size</span><div class="size-row">${['Small', 'Medium', 'Large', 'X-Large'].map((size, index) => `<button class="size-option ${index === 2 ? 'active' : ''}" type="button">${size}</button>`).join('')}</div></div><hr /><div class="purchase-row"><div class="quantity-box"><button type="button" data-quantity="-1">−</button><span id="selected-quantity">1</span><button type="button" data-quantity="1">+</button></div><button type="button" class="add-to-cart-btn" id="add-to-cart">Add to Cart</button></div></div>
    </section>
    <section class="product-tabs"><button class="product-tab" type="button">Product Details</button><button class="product-tab active" type="button">Rating &amp; Reviews</button><button class="product-tab" type="button">FAQs</button></section>
    <section class="review-panel"><div class="review-header"><h3>All Reviews <span class="tag">(${451 + savedReviews.length})</span></h3><div class="review-actions"><button class="filter-review" type="button" aria-label="Filter reviews">☷</button><button class="tag" type="button">Latest⌄</button><button class="write-review" type="button">Write a Review</button></div></div><form class="review-form" hidden><div><label for="reviewer-name">Your name</label><input id="reviewer-name" name="name" maxlength="40" required placeholder="Enter your name" /></div><fieldset class="star-picker"><legend>Your rating</legend><div>${[5, 4, 3, 2, 1].map((rating) => `<input type="radio" id="star-${rating}" name="rating" value="${rating}" ${rating === 5 ? 'checked' : ''} /><label for="star-${rating}" title="${rating} stars">★</label>`).join('')}</div></fieldset><div><label for="review-text">Your review</label><textarea id="review-text" name="review" maxlength="500" required placeholder="Tell us what you think"></textarea></div><div class="review-form-actions"><button type="button" class="cancel-review">Cancel</button><button type="submit">Post Review</button></div></form><div class="review-grid">${allReviews.map(reviewCard).join('')}</div><div class="more-link"><button type="button">Load More Reviews</button></div></section>
    <section class="related-section"><h2 class="related-title">You might also like</h2><div class="related-grid">${related.map((item) => `<article class="related-card"><a href="product.html?id=${item.id}"><img src="${resolveProductImage(item.images?.[0])}" alt="${item.name}" /><h4>${item.name}</h4><p class="related-rating">★★★★★ <small>${item.rating}/5</small></p><div class="related-pricing"><span class="related-price">$${item.price}</span>${item.originalPrice > item.price ? `<span class="related-old-price">$${item.originalPrice}</span>` : ''}</div></a></article>`).join('')}</div></section>`;

  target.querySelectorAll('.size-option, .swatch').forEach((button) => button.addEventListener('click', () => { const group = button.classList.contains('swatch') ? '.swatch' : '.size-option'; target.querySelectorAll(group).forEach((item) => item.classList.remove('active')); button.classList.add('active'); }));
  target.querySelectorAll('[data-quantity]').forEach((button) => button.addEventListener('click', () => { quantity = Math.max(1, quantity + Number(button.dataset.quantity)); target.querySelector('#selected-quantity').textContent = quantity; }));
  target.querySelector('#add-to-cart').addEventListener('click', () => { const cart = ShopStorage.getCart(); const entry = cart.find((item) => item.id === product.id); if (entry) entry.quantity += quantity; else cart.push({ ...product, image: product.images?.[0], size: 'Large', color: 'Olive', quantity }); ShopStorage.setCart(cart); updateCartCount(); });
  const reviewForm = target.querySelector('.review-form');
  target.querySelector('.write-review').addEventListener('click', () => { reviewForm.hidden = false; reviewForm.querySelector('input').focus(); });
  target.querySelector('.cancel-review').addEventListener('click', () => { reviewForm.reset(); reviewForm.hidden = true; });
  reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(reviewForm);
    const review = { name: form.get('name').trim(), copy: form.get('review').trim(), rating: Number(form.get('rating')), date: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()) };
    const saved = JSON.parse(localStorage.getItem(reviewStorageKey) || '[]');
    saved.unshift(review);
    localStorage.setItem(reviewStorageKey, JSON.stringify(saved));
    target.querySelector('.review-grid').insertAdjacentHTML('afterbegin', reviewCard(review));
    const tag = target.querySelector('.review-header h3 .tag');
    tag.textContent = `(${451 + saved.length})`;
    reviewForm.reset();
    reviewForm.hidden = true;
  });
});

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function reviewCard(review) {
  const rating = Math.min(5, Math.max(1, Number(review.rating) || 5));
  return `<article class="review-card"><div class="review-top"><span class="review-stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span><span>•••</span></div><strong class="review-user">${escapeHtml(review.name)} <span style="color:#13a04b">●</span></strong><p>"${escapeHtml(review.copy)}"</p><span class="review-date">Posted on ${escapeHtml(review.date)}</span></article>`;
}

const reviews = [
  { name: 'Samantha D.', copy: 'I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow fashion enthusiast, I appreciate the attention to detail.', date: 'August 14, 2023' },
  { name: 'Alex M.', copy: 'The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I am quite picky about aesthetics.', date: 'August 15, 2023' },
  { name: 'Ethan R.', copy: 'This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect.', date: 'August 16, 2023' },
  { name: 'Olivia P.', copy: 'As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear.', date: 'August 17, 2023' },
  { name: 'Liam K.', copy: 'This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer’s skill.', date: 'August 18, 2023' },
  { name: 'Ava H.', copy: 'I am not just wearing a t-shirt; I am wearing a piece of design philosophy. The intricate details and thoughtful layout make it special.', date: 'August 19, 2023' }
];
