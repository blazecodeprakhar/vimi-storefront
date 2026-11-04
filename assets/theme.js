/**
 * ViMi THEME CORE JAVASCRIPT
 * Controls Mobile Nav, Dedicated Buying Window, Customer Login Modal,
 * Live Drop Countdown, Size/Fit Finder Calculator, and Dynamic Auto-Changing Hero Showcase.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Drawer
  const mobileBtn = document.getElementById('MobileMenuBtn');
  const mobileDrawer = document.getElementById('MobileNavDrawer');
  const mobileClose = document.getElementById('MobileNavClose');
  const mobileOverlay = document.getElementById('MobileNavOverlay');
  const mobileLoginLink = document.getElementById('MobileLoginLink');

  function openMobileNav() {
    if (mobileDrawer) mobileDrawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    if (mobileDrawer) mobileDrawer.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (mobileBtn) mobileBtn.addEventListener('click', openMobileNav);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);

  document.querySelectorAll('.mobile-nav-list a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // =========================================================================
  // DYNAMIC AUTO-CYCLING HERO HOODIE SHOWCASE
  // =========================================================================
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  const heroCounter = document.getElementById('HeroSliderCounter');
  const heroTitle = document.getElementById('HeroTitle');
  const heroPrice = document.getElementById('HeroPrice');
  const heroCompare = document.getElementById('HeroCompare');
  const heroBadgeText = document.getElementById('HeroBadgeText');
  const heroQuickBuyBtn = document.getElementById('HeroSlideQuickBuy');
  const heroAddBagBtn = document.getElementById('HeroSlideAddBag');

  let currentSlide = 0;
  let heroInterval = null;

  function setHeroSlide(index) {
    if (!heroSlides.length) return;
    currentSlide = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    heroDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });

    const activeSlide = heroSlides[currentSlide];
    if (activeSlide) {
      const title = activeSlide.dataset.title;
      const price = activeSlide.dataset.price;
      const compare = activeSlide.dataset.compare;
      const badge = activeSlide.dataset.badge;
      const image = activeSlide.dataset.image;

      if (heroCounter) heroCounter.textContent = `0${currentSlide + 1} / 0${heroSlides.length}`;
      if (heroTitle) heroTitle.textContent = title;
      if (heroPrice) heroPrice.textContent = `₹${parseInt(price).toLocaleString('en-IN')}`;
      if (heroCompare) heroCompare.textContent = `₹${parseInt(compare).toLocaleString('en-IN')}`;
      if (heroBadgeText) heroBadgeText.textContent = badge;

      if (heroQuickBuyBtn) {
        heroQuickBuyBtn.dataset.productTitle = title;
        heroQuickBuyBtn.dataset.productPrice = price;
        heroQuickBuyBtn.dataset.productCompare = compare;
        heroQuickBuyBtn.dataset.productBadge = badge;
        heroQuickBuyBtn.dataset.productImage = image;
      }

      if (heroAddBagBtn) {
        heroAddBagBtn.dataset.productTitle = title;
        heroAddBagBtn.dataset.productPrice = price;
        heroAddBagBtn.dataset.productImage = image;
      }
    }
  }

  // Dynamic duration: Slide 0 (ViMi HEAVYWEIIIGHT Essential) stays for 6500ms; other slides stay for 3000ms
  function getSlideDuration(index) {
    return index === 0 ? 6500 : 3000;
  }

  function resetProgressBars() {
    heroDots.forEach((dot, i) => {
      dot.classList.remove('running');
      const fill = dot.querySelector('.hero-dot-fill');
      if (fill) {
        fill.style.animation = 'none';
        void fill.offsetWidth; // trigger reflow
      }
    });
    const activeDot = heroDots[currentSlide];
    if (activeDot) {
      activeDot.classList.add('running');
      const fill = activeDot.querySelector('.hero-dot-fill');
      if (fill) {
        const dur = getSlideDuration(currentSlide);
        fill.style.animation = `heroDotProgress ${dur}ms linear forwards`;
      }
    }
  }

  function scheduleNextSlide() {
    if (heroInterval) clearTimeout(heroInterval);
    resetProgressBars();
    const duration = getSlideDuration(currentSlide);
    heroInterval = setTimeout(() => {
      setHeroSlide(currentSlide + 1);
      scheduleNextSlide();
    }, duration);
  }

  heroDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      setHeroSlide(idx);
      scheduleNextSlide(); // Reset timer on manual click
    });
  });

  if (heroSlides.length) {
    scheduleNextSlide();
  }
  // 1. Prev / Next Stage Arrows
  const btnPrev = document.getElementById('HeroStagePrev');
  const btnNext = document.getElementById('HeroStageNext');
  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setHeroSlide(currentSlide - 1);
      scheduleNextSlide();
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setHeroSlide(currentSlide + 1);
      scheduleNextSlide();
    });
  }

  // 2. Mobile Touch Swipe Gestures
  const stageEl = document.getElementById('HeroSliderStage');
  if (stageEl) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    stageEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    stageEl.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      // Only trigger horizontal swipe if movement is predominantly horizontal
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          setHeroSlide(currentSlide + 1);
        } else {
          setHeroSlide(currentSlide - 1);
        }
        scheduleNextSlide();
      }
    }, { passive: true });
  }

  // 3. Desktop 3D Interactive Card Tilt on Mouse Move
  const showcaseCard = document.getElementById('HeroShowcase');
  if (showcaseCard && window.innerWidth > 992) {
    showcaseCard.addEventListener('mousemove', (e) => {
      const rect = showcaseCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / (rect.height / 2)) * 5;
      const rotateY = (x / (rect.width / 2)) * 5;
      showcaseCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    });
    showcaseCard.addEventListener('mouseleave', () => {
      showcaseCard.style.transform = '';
    });
  }


  // =========================================================================
  // LIVE DROP COUNTDOWN TIMER
  // =========================================================================
  const elDays = document.getElementById('TimerDays');
  const elHours = document.getElementById('TimerHours');
  const elMins = document.getElementById('TimerMins');
  const elSecs = document.getElementById('TimerSecs');

  if (elDays && elHours && elMins && elSecs) {
    let totalSeconds = (3 * 24 * 3600) + (14 * 3600) + (28 * 60) + 45;
    setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
        const d = Math.floor(totalSeconds / (3600 * 24));
        const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        elDays.textContent = String(d).padStart(2, '0');
        elHours.textContent = String(h).padStart(2, '0');
        elMins.textContent = String(m).padStart(2, '0');
        elSecs.textContent = String(s).padStart(2, '0');
      }
    }, 1000);
  }

  // =========================================================================
  // INTERACTIVE SIZE & FIT CALCULATOR
  // =========================================================================
  const fitHeight = document.getElementById('FitHeight');
  const fitWeight = document.getElementById('FitWeight');
  const fitVibe = document.getElementById('FitVibe');
  const fitResult = document.getElementById('FitResultBadge');

  const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];

  function updateFitRecommendation() {
    if (!fitHeight || !fitWeight || !fitVibe || !fitResult) return;

    let baseSizeIndex = sizeOrder.indexOf(fitHeight.value);
    if (baseSizeIndex === -1) baseSizeIndex = 2; // Default to L

    const weightAdj = parseInt(fitWeight.value) || 0;
    const vibeAdj = parseInt(fitVibe.value) || 0;

    let finalIndex = baseSizeIndex + weightAdj + vibeAdj;
    finalIndex = Math.max(0, Math.min(sizeOrder.length - 1, finalIndex));

    const recSize = sizeOrder[finalIndex];
    let note = '';
    if (recSize === 'S') note = 'Tailored for clean shoulder drape without overwhelming your frame.';
    else if (recSize === 'M') note = 'Ideal balanced boxy cut with standard street length.';
    else if (recSize === 'L') note = 'Our signature drop-shoulder proportion with relaxed wrist stacking.';
    else if (recSize === 'XL') note = 'Deep oversized aesthetic with substantial loopback drape.';
    else if (recSize === 'XXL') note = 'Maximum architectural volume and statement street presence.';

    fitResult.innerHTML = `🎯 Recommended Size: <strong>${recSize}</strong> — ${note}`;
  }

  if (fitHeight) fitHeight.addEventListener('change', updateFitRecommendation);
  if (fitWeight) fitWeight.addEventListener('change', updateFitRecommendation);
  if (fitVibe) fitVibe.addEventListener('change', updateFitRecommendation);

  // =========================================================================
  // DEDICATED BUYING WINDOW MODAL
  // =========================================================================
  const buyingWindow = document.getElementById('BuyingWindowModal');
  const bwCloseTriggers = document.querySelectorAll('[data-buying-window-close]');
  const bwImage = document.getElementById('BuyingWindowImage');
  const bwTitle = document.getElementById('BuyingWindowTitle');
  const bwPrice = document.getElementById('BuyingWindowPrice');
  const bwCompare = document.getElementById('BuyingWindowCompare');
  const bwDiscount = document.getElementById('BuyingWindowDiscount');
  const bwBadge = document.getElementById('BuyingWindowBadge');
  const bwQtyInput = document.getElementById('BwQtyInput');
  const bwAddBtn = document.getElementById('BwAddBagBtn');
  const bwBuyNowBtn = document.getElementById('BwBuyNowBtn');

  let currentSelectedProduct = {
    title: 'ViMi Signature Drop-Shoulder Oversized Hoodie',
    price: 1999,
    compare: 2999,
    image: 'vimi-hoodie-01.jpg',
    size: 'L',
    quantity: 1
  };

  function openBuyingWindow(data) {
    if (!buyingWindow) return;
    
    currentSelectedProduct.title = data.title || 'ViMi Luxury Hoodie';
    currentSelectedProduct.price = data.price || 1999;
    currentSelectedProduct.compare = data.compare || 2999;
    currentSelectedProduct.image = data.image || 'vimi-hoodie-01.jpg';
    currentSelectedProduct.size = 'L';
    currentSelectedProduct.quantity = 1;

    if (bwTitle) bwTitle.textContent = currentSelectedProduct.title;
    if (bwPrice) bwPrice.textContent = `₹${currentSelectedProduct.price.toLocaleString('en-IN')}`;
    if (bwCompare) bwCompare.textContent = `₹${currentSelectedProduct.compare.toLocaleString('en-IN')}`;
    if (bwBadge) bwBadge.textContent = data.badge || 'EXCLUSIVE';
    if (bwQtyInput) bwQtyInput.value = 1;

    if (bwDiscount && currentSelectedProduct.compare > currentSelectedProduct.price) {
      const discount = Math.round(((currentSelectedProduct.compare - currentSelectedProduct.price) / currentSelectedProduct.compare) * 100);
      bwDiscount.textContent = `${discount}% OFF`;
    }

    if (bwImage) {
      bwImage.classList.remove('vimi-loaded');
      const bwWrapper = bwImage.closest('.buying-window-media');
      if (bwWrapper) bwWrapper.classList.remove('vimi-shimmer-off');
      
      const imgPath = data.image.includes('/') ? data.image : `./assets/hoodies/${data.image}`;
      bwImage.src = imgPath;
      bwImage.onload = function() {
        if (typeof window.vimiImgLoaded === 'function') window.vimiImgLoaded(this);
      };
      bwImage.onerror = function() {
        this.src = `./assets/${data.image}`;
        if (typeof window.vimiImgLoaded === 'function') window.vimiImgLoaded(this);
      };
      if (bwImage.complete && bwImage.naturalWidth > 0) {
        if (typeof window.vimiImgLoaded === 'function') window.vimiImgLoaded(bwImage);
      }
    }

    document.querySelectorAll('.bw-size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === 'L');
    });

    buyingWindow.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeBuyingWindow() {
    if (buyingWindow) {
      buyingWindow.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  bwCloseTriggers.forEach(el => el.addEventListener('click', closeBuyingWindow));

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.open-buying-window');
    if (!trigger) return;
    e.preventDefault();

    const rawPrice = parseInt(trigger.dataset.productPrice) || 199900;
    const rawCompare = parseInt(trigger.dataset.productCompare) || 299900;
    const priceInRs = rawPrice > 10000 ? Math.round(rawPrice / 100) : rawPrice;
    const compareInRs = rawCompare > 10000 ? Math.round(rawCompare / 100) : rawCompare;

    openBuyingWindow({
      title: trigger.dataset.productTitle,
      price: priceInRs,
      compare: compareInRs,
      badge: trigger.dataset.productBadge,
      image: trigger.dataset.productImage || 'vimi-hoodie-01.jpg'
    });
  });

  document.querySelectorAll('.bw-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bw-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSelectedProduct.size = btn.dataset.size;
    });
  });

  const bwMinus = document.getElementById('BwQtyMinus');
  const bwPlus = document.getElementById('BwQtyPlus');
  if (bwMinus && bwPlus && bwQtyInput) {
    bwMinus.addEventListener('click', () => {
      let v = parseInt(bwQtyInput.value) || 1;
      if (v > 1) {
        bwQtyInput.value = v - 1;
        currentSelectedProduct.quantity = v - 1;
      }
    });
    bwPlus.addEventListener('click', () => {
      let v = parseInt(bwQtyInput.value) || 1;
      if (v < 10) {
        bwQtyInput.value = v + 1;
        currentSelectedProduct.quantity = v + 1;
      }
    });
  }

  if (bwAddBtn) {
    bwAddBtn.addEventListener('click', () => {
      if (window.vimiCartAPI) {
        window.vimiCartAPI.addItem({
          title: `${currentSelectedProduct.title} (Size: ${currentSelectedProduct.size})`,
          price: currentSelectedProduct.price,
          quantity: currentSelectedProduct.quantity,
          image: currentSelectedProduct.image
        });
      }
      closeBuyingWindow();
    });
  }

  if (bwBuyNowBtn) {
    bwBuyNowBtn.addEventListener('click', () => {
      if (window.vimiCartAPI) {
        window.vimiCartAPI.addItem({
          title: `${currentSelectedProduct.title} (Size: ${currentSelectedProduct.size})`,
          price: currentSelectedProduct.price,
          quantity: currentSelectedProduct.quantity,
          image: currentSelectedProduct.image
        });
      }
      closeBuyingWindow();
      const checkoutBtn = document.querySelector('.btn--checkout');
      if (checkoutBtn) checkoutBtn.click();
    });
  }

  // =========================================================================
  // CUSTOMER LOGIN / ACCOUNT MODAL
  // =========================================================================
  const loginModal = document.getElementById('LoginModal');
  const loginTrigger = document.getElementById('LoginTrigger');
  const loginCloseTriggers = document.querySelectorAll('[data-login-close]');
  const tabSignIn = document.getElementById('TabSignIn');
  const tabRegister = document.getElementById('TabRegister');
  const formSignIn = document.getElementById('FormSignIn');
  const formRegister = document.getElementById('FormRegister');

  function openLoginModal() {
    if (loginModal) {
      loginModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLoginModal() {
    if (loginModal) {
      loginModal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  if (loginTrigger) loginTrigger.addEventListener('click', openLoginModal);
  if (mobileLoginLink) mobileLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeMobileNav();
    openLoginModal();
  });
  loginCloseTriggers.forEach(el => el.addEventListener('click', closeLoginModal));

  if (tabSignIn && tabRegister && formSignIn && formRegister) {
    tabSignIn.addEventListener('click', () => {
      tabSignIn.classList.add('active');
      tabRegister.classList.remove('active');
      formSignIn.style.display = 'flex';
      formRegister.style.display = 'none';
    });
    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabSignIn.classList.remove('active');
      formRegister.style.display = 'flex';
      formSignIn.style.display = 'none';
    });
  }

  window.handleLoginSuccess = function(msg) {
    closeLoginModal();
    window.showVimiToast(msg);
  };

  // Filter tabs
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;

      productCards.forEach(card => {
        const text = card.innerText.toLowerCase();
        if (filter === 'all') {
          card.style.display = 'flex';
        } else if (filter === 'oversized') {
          card.style.display = text.includes('oversized') || text.includes('450 gsm') || text.includes('boxy') ? 'flex' : 'none';
        } else if (filter === 'acid-wash') {
          card.style.display = text.includes('acid') || text.includes('wash') || text.includes('vintage') ? 'flex' : 'none';
        } else if (filter === 'graphics') {
          card.style.display = text.includes('graphic') || text.includes('skeleton') || text.includes('reaper') || text.includes('cyber') || text.includes('anarchy') ? 'flex' : 'none';
        } else if (filter === 'minimalist') {
          card.style.display = text.includes('minimal') || text.includes('monolith') || text.includes('essential') || text.includes('void') ? 'flex' : 'none';
        }
      });
    });
  });
});

/**
 * Global Toast Helper
 */
window.showVimiToast = function(message) {
  let toast = document.getElementById('VimiToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'VimiToast';
    toast.className = 'vimi-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-active');

  setTimeout(() => {
    toast.classList.remove('is-active');
  }, 3200);
};

// Locked Navigation Bar Scroll Effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (header) {
    if (window.scrollY > 15) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  }
}, { passive: true });


// =========================================================
// ViMi Dedicated Mobile Hero Carousel Synchronizer
// =========================================================
(function(){
  function initMobileHero(){
    var s = document.getElementById('mSlides');
    var d = document.querySelectorAll('#mDots i');
    var nameEl = document.getElementById('mName');
    var metaEl = document.getElementById('mMeta');
    var priceEl = document.getElementById('mPrice');
    var buyBtn = document.getElementById('MobileHeroQuickBuy');
    var addBtn = document.getElementById('MobileHeroAddBag');
    if(!s) return;
    s.addEventListener('scroll', function(){
      var i = Math.round(s.scrollLeft / s.clientWidth);
      d.forEach(function(x, k){ x.classList.toggle('on', k === i); });
      var slides = s.querySelectorAll('.m-slide');
      if(slides[i]){
        var sl = slides[i];
        if(nameEl) nameEl.textContent = sl.dataset.title;
        if(metaEl) metaEl.textContent = sl.dataset.meta;
        if(priceEl) priceEl.innerHTML = sl.dataset.price + '<s>' + sl.dataset.compare + '</s>';
        if(buyBtn) {
          buyBtn.dataset.productTitle = sl.dataset.title;
          buyBtn.dataset.productPrice = sl.dataset.rawPrice;
          buyBtn.dataset.productCompare = sl.dataset.rawCompare;
          buyBtn.dataset.productImage = sl.dataset.img;
        }
        if(addBtn) {
          addBtn.dataset.productTitle = sl.dataset.title;
          addBtn.dataset.productPrice = sl.dataset.rawPrice;
          addBtn.dataset.productImage = sl.dataset.img;
        }
      }
    }, { passive: true });
  }
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileHero);
  } else {
    initMobileHero();
  }
})();

/* ==========================================================================
   ViMi GLOBAL IMAGE LOADER & SHIMMER ORCHESTRATOR
   Ensures instantaneous smooth blur-up and metallic shimmer dismissals
   ========================================================================== */
window.vimiImgLoaded = function(img) {
  if (!img) return;
  img.classList.add('vimi-loaded');
  const wrapper = img.closest('.product-card__media-wrapper, .m-slide, .hero-slide, .buying-window-media');
  if (wrapper) {
    wrapper.classList.add('vimi-shimmer-off');
  }
};

function initVimiGlobalImageLoader() {
  const selector = '.product-card__image, .m-slide-img, .hero-slide-img, .buying-window-img';
  const imgs = document.querySelectorAll(selector);
  
  imgs.forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      window.vimiImgLoaded(img);
    } else {
      img.addEventListener('load', function() {
        window.vimiImgLoaded(this);
      }, { once: true });
      img.addEventListener('error', function() {
        // Safety timeout so broken/fallback states still reveal cleanly
        setTimeout(() => window.vimiImgLoaded(this), 300);
      }, { once: true });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVimiGlobalImageLoader);
} else {
  initVimiGlobalImageLoader();
}
