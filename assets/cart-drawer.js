/**
 * ViMi AJAX CART DRAWER
 * Full support for both live Shopify AJAX endpoints & demo mode preview.
 */

(function () {
  const FREE_SHIPPING_THRESHOLD = 999; // ₹999 for free delivery in India

  let demoCartItems = [];

  const cartDrawer = document.getElementById('CartDrawer');
  const cartTrigger = document.getElementById('CartTrigger');
  const cartCloseTriggers = document.querySelectorAll('[data-cart-close]');
  const cartCountBadges = [
    document.getElementById('HeaderCartBadge'),
    document.getElementById('CartDrawerCount')
  ];
  const cartList = document.getElementById('CartDrawerList');
  const cartEmpty = document.getElementById('CartDrawerEmpty');
  const cartFooter = document.getElementById('CartDrawerFooter');
  const subtotalEl = document.getElementById('CartDrawerSubtotal');
  const checkoutTotalEl = document.getElementById('CartDrawerCheckoutTotal');
  const shippingMsgEl = document.getElementById('ShippingBarMessage');
  const shippingFillEl = document.getElementById('ShippingBarFill');

  function openCart() {
    if (cartDrawer) {
      cartDrawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCart() {
    if (cartDrawer) {
      cartDrawer.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  if (cartTrigger) cartTrigger.addEventListener('click', openCart);
  cartCloseTriggers.forEach(el => el.addEventListener('click', closeCart));

  // Update Free Shipping Progress Bar
  function updateShippingBar(totalRupees) {
    if (!shippingMsgEl || !shippingFillEl) return;
    if (totalRupees >= FREE_SHIPPING_THRESHOLD) {
      shippingMsgEl.innerHTML = '🎉 <strong>FREE Pan-India Express Delivery Unlocked!</strong>';
      shippingFillEl.style.width = '100%';
    } else {
      const remaining = FREE_SHIPPING_THRESHOLD - totalRupees;
      const percent = Math.min(100, Math.round((totalRupees / FREE_SHIPPING_THRESHOLD) * 100));
      shippingMsgEl.innerHTML = `Add ₹${remaining} more to unlock <strong>FREE Express Shipping across India</strong> 🚚`;
      shippingFillEl.style.width = `${percent}%`;
    }
  }

  // Render Cart Items
  function renderCart(items, totalAmountRupees) {
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

    cartCountBadges.forEach(badge => {
      if (badge) badge.textContent = totalCount;
    });

    if (items.length === 0) {
      if (cartEmpty) cartEmpty.style.display = 'block';
      if (cartList) cartList.style.display = 'none';
      if (cartFooter) cartFooter.style.display = 'none';
      updateShippingBar(0);
      return;
    }

    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartList) cartList.style.display = 'flex';
    if (cartFooter) cartFooter.style.display = 'block';

    const formattedTotal = `₹${totalAmountRupees.toLocaleString('en-IN')}`;
    if (subtotalEl) subtotalEl.textContent = formattedTotal;
    if (checkoutTotalEl) checkoutTotalEl.textContent = formattedTotal;

    updateShippingBar(totalAmountRupees);

    if (cartList) {
      cartList.innerHTML = items.map((item, index) => {
        const imgPath = item.image ? (item.image.includes('/') ? item.image : `./assets/hoodies/${item.image}`) : './assets/vimi-hoodie-01.jpg';
        return `
        <div class="drawer-cart-item" data-index="${index}">
          <div class="drawer-item-img">
            <img src="${imgPath}" alt="${item.title}" onerror="this.src='./assets/vimi-hoodie-01.jpg';">
          </div>
          <div class="drawer-item-details">
            <div class="drawer-item-title">${item.title}</div>
            <div class="drawer-item-price">₹${item.price.toLocaleString('en-IN')}</div>
            <div class="drawer-item-qty">
              <button type="button" class="drawer-qty-btn" data-action="decrease" data-index="${index}">−</button>
              <span>${item.quantity}</span>
              <button type="button" class="drawer-qty-btn" data-action="increase" data-index="${index}">+</button>
              <button type="button" class="drawer-remove-btn" data-action="remove" data-index="${index}">Remove</button>
            </div>
          </div>
        </div>
      `;
      }).join('');

      cartList.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.currentTarget.dataset.action;
          const idx = parseInt(e.currentTarget.dataset.index);
          if (action === 'increase') {
            demoCartItems[idx].quantity += 1;
          } else if (action === 'decrease') {
            demoCartItems[idx].quantity -= 1;
            if (demoCartItems[idx].quantity <= 0) demoCartItems.splice(idx, 1);
          } else if (action === 'remove') {
            demoCartItems.splice(idx, 1);
          }
          const total = demoCartItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
          renderCart(demoCartItems, total);
        });
      });
    }
  }

  function addDemoItem(title, price, image = 'vimi-hoodie-01.jpg', qty = 1) {
    const existing = demoCartItems.find(it => it.title === title);
    if (existing) {
      existing.quantity += qty;
    } else {
      demoCartItems.push({ title, price, quantity: qty, image });
    }
    const total = demoCartItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    renderCart(demoCartItems, total);
    openCart();
    if (window.showVimiToast) {
      window.showVimiToast(`Added "${title}" to your bag!`);
    }
  }

  // Public API for theme scripts & Buying Window
  window.vimiCartAPI = {
    addItem: function (item) {
      addDemoItem(item.title, item.price, item.image, item.quantity || 1);
    },
    open: openCart,
    close: closeCart
  };

  // Handle Quick Add buttons
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.btn-quick-add');
    if (!addBtn) return;
    e.preventDefault();

    const title = addBtn.dataset.productTitle || 'ViMi Heavyweight Hoodie';
    const rawPrice = parseInt(addBtn.dataset.productPrice) || 199900;
    const priceInRupees = rawPrice > 10000 ? Math.round(rawPrice / 100) : rawPrice;
    const image = addBtn.dataset.productImage || 'vimi-hoodie-01.jpg';

    if (window.Shopify && window.Shopify.routes) {
      const variantId = addBtn.dataset.productId;
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 })
      })
      .then(res => res.json())
      .then(() => fetch('/cart.js').then(r => r.json()))
      .then(cart => {
        const items = cart.items.map(it => ({
          title: it.product_title,
          price: Math.round(it.final_price / 100),
          quantity: it.quantity,
          image: it.image
        }));
        renderCart(items, Math.round(cart.total_price / 100));
        openCart();
      })
      .catch(() => {
        addDemoItem(title, priceInRupees, image);
      });
    } else {
      addDemoItem(title, priceInRupees, image);
    }
  });

})();
