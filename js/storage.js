const ShopStorage = {
  getCart: () => JSON.parse(localStorage.getItem('shop-co-cart') || '[]'),
  setCart: (cart) => localStorage.setItem('shop-co-cart', JSON.stringify(cart))
};
