'use strict';

const PRODUCTS = [
  {
    id: 'camiseta-movimento',
    name: 'Bola Topper Slick',
    price: 84.90,
    category: 'futebol',
    type: 'Camisetas',
    detailImage: 'assets/bola.png',
    images: ['assets/bola_semtrave_saturado.jpg', 'assets/bolaa.jpg'],
    image: 'assets/bolaa.jpg',
    description: 'Alta durabilidade para garantir muitos momentos em família. Sinta a diversão do momento proporcionada pela qualidade da fabricação pensada no seu lazer.',
    color: 'Azul',
    composition: 'Costura reforçada • produção não-poluente',
    hex: '#24959b',
    autor: 'Sophia Sales'
  },
  {
    id: 'tenis-street',
    name: 'Halter',
    price: 49.90,
    category: 'basquete',
    type: 'Item',
    detailImage: 'assets/halter-1.jpg',
    images: ['assets/halter-editado.jpg', 'assets/halter-1.jpg'],
    image: 'assets/halter-1.jpg',
    description: 'O Halter de 2kg é ideal para quem busca melhorar o condicionamento físico e muscular, além de aumentar a resistência. É muito confortável e seu formato sextavado proporciona maior estabilidade, evitando que o equipamento role ao ser apoiado no chão. Pode ser utilizado tanto em academias quanto em casa, sendo uma ótima opção para iniciantes e para exercícios que utilizam cargas leves.',
    color: 'Azul',
    composition: 'Estilo casual esportivo',
    hex: '#00ACDE',
    autor: 'Ana Luiza da Silva'
  },
  {
    id: 'mochila-urbana',
    name: 'Bicicleta infantil',
    price: 459.90,
    category: 'skate',
    type: 'Mochilas',
    detailImage: 'assets/bicicleta.jpeg',
    images: ['assets/bicicleta-editada.jpeg', 'assets/bicicleta.jpeg'],
    image: 'assets/bicicleta.jpeg',
    description: 'Bicicleta infantil. Confortável e ideal para passeios e atividades físicas leves.',
    color: 'Rosa',
    composition: 'Modelo urbano • Metal • Ideal para crianças de 8 anos',
    hex: '#fc8dd4',
    autor: 'Rafaella Sannt\'anna'
  },
  {
    id: 'garrafa-NECO',
    name: 'Garrafa NECO',
    price: 59.90,
    category: 'corrida',
    type: 'Acessórios',
    detailImage: 'assets/basquete.jpg',
    images: ['assets/bola-editada.jpg', 'assets/basquete.jpg'],
    image: 'assets/basquete.jpg',
    description: 'Acompanhe sua rotina de exercícios com a Garrafa NECO.',
    color: 'Laranja',
    composition: 'Garrafa reutilizável • tampa rosqueável',
    hex: '#e43601',
    autor: 'Kleber da Silva'
  },
  {
    id: 'luva',
    name: 'Garrafa NECO',
    price: 59.90,
    category: 'corrida',
    type: 'Acessórios',
    detailImage: 'assets/box.jpg',
    images: ['assets/box-editada.jpg', 'assets/box.jpg'],
    image: 'assets/box.jpg',
    description: 'Acompanhe sua rotina de exercícios com a Garrafa NECO.',
    color: 'Preto',
    composition: 'Garrafa reutilizável • tampa rosqueável',
    hex: '#0f0f0f',
    autor: 'Kleber da Silva'
  }
];


const CATEGORY_NAMES = {
  all: 'Produtos em destaque',
  futebol: 'Futebol',
  basquete: 'Basquete',
  skate: 'Skate',
  corrida: 'Corrida'
};

const byId = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(value);

const icon = name =>
  `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

const productById = id => PRODUCTS.find(p => p.id === id);
const FREE_SHIPPING_THRESHOLD = 199;

// Guarda a foto selecionada individualmente para cada produto.
const galleryIndexes = {};

function getProductImages(product) {
  return product.images?.length ? product.images : [product.image];
}

// Controle das setas
function changeGallery(id, direction) {
  const product = productById(id);
  if (!product) return;

  const images = getProductImages(product);
  if (images.length <= 1) return;

  const currentIndex = galleryIndexes[id] || 0;

  galleryIndexes[id] =
    (currentIndex + direction + images.length) % images.length;

  const gallery = productGrid.querySelector(
    `[data-gallery="${id}"]`
  );

  if (!gallery) return;

  const image = gallery.querySelector('.product-gallery-image');
  const indicator = gallery.querySelector('.gallery-indicator');

  if (image) {
    image.src = images[galleryIndexes[id]];
  }

  if (indicator) {
    indicator.textContent =
      `${galleryIndexes[id] + 1}/${images.length}`;
  }
}

function readStore(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A navegação privada pode bloquear armazenamento.
  }
}

let cart = readStore('NECO_cart_v1', []);
if (!Array.isArray(cart)) cart = [];

cart = cart
  .filter(item =>
    productById(item.id) &&
    Number.isInteger(item.qty) &&
    item.qty > 0
  )
  .map(item => ({
    id: item.id,
    qty: Math.min(item.qty, 99)
  }));

let favorites = readStore('NECO_favorites_v1', []);
if (!Array.isArray(favorites)) favorites = [];
favorites = favorites.filter(id => productById(id));

let orders = readStore('NECO_orders_v1', []);
if (!Array.isArray(orders)) orders = [];

let profile = readStore('NECO_profile_v1', {});
if (!profile || typeof profile !== 'object') profile = {};

let category = 'all';
let onlyFavorites = false;
let query = '';
let activeProduct = null;
let selectedQty = 1;
let toastTimeout;

const productGrid = byId('productGrid');
const productDialog = byId('productDialog');
const cartDialog = byId('cartDialog');
const accountDialog = byId('accountDialog');

const dialogs = [
  productDialog,
  cartDialog,
  accountDialog
];

function notify(message) {
  const el = byId('toast');
  clearTimeout(toastTimeout);
  el.textContent = message;
  el.classList.add('is-visible');

  toastTimeout = setTimeout(
    () => el.classList.remove('is-visible'),
    3200
  );
}

function openDialog(dialog) {
  dialogs.forEach(item => {
    if (item.open && item !== dialog) item.close();
  });

  if (!dialog.open) dialog.showModal();

  document.body.classList.add('modal-open');
}

function closeDialog(dialog) {
  if (dialog.open) dialog.close();
}

dialogs.forEach(dialog => {
  dialog.addEventListener('close', () => {
    if (!dialogs.some(other => other.open)) {
      document.body.classList.remove('modal-open');
    }
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog(dialog);
  });

  dialog.querySelectorAll('[data-close-dialog]').forEach(button => {
    button.addEventListener('click', () => closeDialog(dialog));
  });
});

// VITRINE DE PRODUTOS
function renderProducts() {
  const filtered = PRODUCTS.filter(p => {
    const matchesCategory =
      category === 'all' || p.category === category;

    const haystack =
      `${p.name} ${p.category} ${p.type} ${p.description}`
        .toLocaleLowerCase('pt-BR');

    const matchesQuery =
      haystack.includes(query.toLocaleLowerCase('pt-BR'));

    return matchesCategory &&
      matchesQuery &&
      (!onlyFavorites || favorites.includes(p.id));
  });

  const heading = onlyFavorites
    ? 'Meus favoritos'
    : query
      ? 'Resultados da pesquisa'
      : CATEGORY_NAMES[category];

  byId('productsTitle').textContent = heading;

  byId('productsSubtitle').hidden =
    category === 'all' && !query && !onlyFavorites;

  byId('productsSubtitle').textContent =
    query ? `BUSCA: ${query}` : 'SELEÇÃO NECO';

  document.querySelectorAll('[data-category]').forEach(btn => {
    btn.classList.toggle(
      'is-selected',
      btn.dataset.category === category && category !== 'all'
    );
  });

  byId('favoritesBtn').classList.toggle('is-active', onlyFavorites);

  byId('favoritesBtn').setAttribute(
    'aria-pressed',
    String(onlyFavorites)
  );

  productGrid.innerHTML = filtered.map(p => {
    const images = getProductImages(p);
    const currentIndex = galleryIndexes[p.id] || 0;

    return `
      <article class="product-card">

        <button
          type="button"
          class="favorite-btn ${favorites.includes(p.id) ? 'is-favorite' : ''}"
          data-fav-id="${p.id}"
          aria-label="${favorites.includes(p.id) ? 'Remover' : 'Adicionar'} ${p.name} ${favorites.includes(p.id) ? 'dos' : 'aos'} favoritos"
          aria-pressed="${favorites.includes(p.id)}"
        >
          ${icon('heart')}
        </button>

        <div class="product-media product-gallery"
             data-gallery="${p.id}">

          <button
            type="button"
            class="product-open"
            data-open-id="${p.id}"
            aria-label="Ver detalhes de ${p.name}"
          >
            <img
              src="${images[currentIndex]}"
              alt="${p.name}"
              loading="lazy"
              class="product-gallery-image"
            >
          </button>

          ${images.length > 1 ? `
            <button
              type="button"
              class="gallery-arrow gallery-prev"
              data-gallery-action="prev"
              data-gallery-id="${p.id}"
              aria-label="Foto anterior"
            >
              &#10094;
            </button>

            <button
              type="button"
              class="gallery-arrow gallery-next"
              data-gallery-action="next"
              data-gallery-id="${p.id}"
              aria-label="Próxima foto"
            >
              &#10095;
            </button>

            <span class="gallery-indicator">
              ${currentIndex + 1}/${images.length}
            </span>
          ` : ''}

        </div>

        <button
          type="button"
          class="product-open product-copy"
          data-open-id="${p.id}"
          aria-label="Ver detalhes de ${p.name}"
        >
          <span class="product-name">${p.name}</span>
          <strong class="product-price">${money(p.price)}</strong>
        </button>

      </article>
    `;
  }).join('');

  byId('emptyState').hidden = filtered.length !== 0;
}

function setCategory(next) {
  category = next;
  onlyFavorites = false;
  query = '';

  byId('searchInput').value = '';

  renderProducts();

  byId('produtos').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function showAll() {
  category = 'all';
  onlyFavorites = false;
  query = '';

  byId('searchInput').value = '';

  renderProducts();

  byId('produtos').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(item => item !== id);
    notify('Produto removido dos favoritos.');
  } else {
    favorites.push(id);
    notify('Produto salvo nos favoritos!');
  }

  writeStore('NECO_favorites_v1', favorites);
  renderProducts();

  if (activeProduct?.id === id && productDialog.open) {
    const btn = byId('detailFavorite');

    btn.textContent = favorites.includes(id)
      ? '♥ Salvo nos favoritos'
      : '♡ Adicionar aos favoritos';
  }
}

// DETALHES DO PRODUTO
function openProduct(id) {
  activeProduct = productById(id);
  if (!activeProduct) return;

  selectedQty = 1;

  renderProductDetail();
  openDialog(productDialog);
}

function renderProductDetail() {
  const p = activeProduct;
  if (!p) return;

  byId('productDetail').innerHTML = `
    <div class="detail-layout">

      <div class="detail-gallery">
        <span class="gallery-category-label">
          NECO / MOVIMENTO
        </span>

        <img
          class="main-product-image"
          id="mainProductImage"
          src="${p.detailImage || p.image}"
          alt="Imagem ampliada de ${p.name}"
          title="Clique para ampliar a imagem"
        >

        <span class="zoom-hint">
          ${icon('zoom')} Clique na imagem para ampliar
        </span>
      </div>

      <div class="detail-info">

        <p class="detail-eyebrow">${p.type} / NECO</p>

        <h2 id="detailName">${p.name}</h2>

        <p class="detail-price">${money(p.price)}</p>

        <div class="rating-line" aria-label="Coleção Movimento">
          ★★★★★ <span>Coleção Movimento</span>
        </div>

        <p class="detail-description">${p.description}</p>

        <div class="option-group">
          <p class="option-title">Cor: ${p.color}</p>
          <div class="color-list">
            <span class="color-item">
              <span class="color-dot" aria-hidden="true" style="background:${p.hex}"></span>
              ${p.color}
            </span>
          </div>
        </div>

        <div class="qty-row">
          <p class="option-title" style="margin:0">
            Quantidade:
          </p>

          <div class="qty-control">
            <button
              type="button"
              data-detail-qty="-1"
              aria-label="Diminuir quantidade"
            >
              ${icon('minus')}
            </button>

            <span id="detailQty">${selectedQty}</span>

            <button
              type="button"
              data-detail-qty="1"
              aria-label="Aumentar quantidade"
            >
              ${icon('plus')}
            </button>
          </div>
        </div>

        <button
          type="button"
          class="button button-yellow detail-add"
          id="addCartBtn"
        >
          ${icon('cart')} ADICIONAR AO CARRINHO
        </button>

        <button
          type="button"
          class="text-link"
          id="detailFavorite"
          style="align-self:flex-start"
        >
          ${favorites.includes(p.id)
            ? '♥ Salvo nos favoritos'
            : '♡ Adicionar aos favoritos'}
        </button>

        <div class="detail-benefits">
          <div class="benefit">
            ${icon('box')}
            <span>Autor<small>${p.autor}</small></span>
          </div>

      </div>
    </div>
  `;
}

// CARRINHO
function addToCart(id, qty) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty = Math.min(99, existing.qty + qty);
  } else {
    cart.push({ id, qty });
  }

  writeStore('NECO_cart_v1', cart);
  updateCartCount();
}

function cartTotals() {
  return cart.reduce(
    (sum, item) =>
      sum + productById(item.id).price * item.qty,
    0
  );
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartCount() {
  const count = cartCount();

  byId('cartCount').textContent =
    count > 99 ? '99+' : String(count);

  byId('cartBtn').setAttribute(
    'aria-label',
    `Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`
  );
}

function renderCart() {
  byId('cartHeaderCount').textContent = `(${cartCount()})`;

  if (!cart.length) {
    byId('cartItems').innerHTML = `
      <div class="cart-empty">
        ${icon('cart')}
        <h3>Seu carrinho está vazio</h3>
        <p>Que tal escolher seu próximo item da NECO?</p>
        <button class="button button-dark" id="continueShopping">
          VER PRODUTOS ${icon('arrow')}
        </button>
      </div>
    `;

    byId('cartBottom').innerHTML = '';
    return;
  }

  byId('cartItems').innerHTML = cart.map((item, idx) => {
    const p = productById(item.id);

    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">

        <div>
          <div class="cart-item-head">
            <div>
              <div class="cart-item-name">${p.name}</div>
              <div class="cart-item-spec">
                ${p.color}
              </div>
            </div>

            <button
              class="cart-remove"
              data-cart-remove="${idx}"
              aria-label="Remover ${p.name}"
            >
              Remover
            </button>
          </div>

          <div class="cart-item-price">
            ${money(p.price * item.qty)}
          </div>

          <div class="cart-item-bottom">
            <div class="qty-control">
              <button
                type="button"
                data-cart-delta="${idx}:-1"
                aria-label="Diminuir ${p.name}"
              >
                ${icon('minus')}
              </button>

              <span>${item.qty}</span>

              <button
                type="button"
                data-cart-delta="${idx}:1"
                aria-label="Aumentar ${p.name}"
              >
                ${icon('plus')}
              </button>
            </div>

            <span class="cart-item-spec">
              ${money(p.price)} / un.
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const total = cartTotals();

  const shippingMessage =
    total >= FREE_SHIPPING_THRESHOLD
      ? 'Seu pedido atingiu o valor ilustrativo de frete grátis!'
      : `Faltam ${money(FREE_SHIPPING_THRESHOLD - total)} para o frete grátis ilustrativo.`;

  byId('cartBottom').innerHTML = `
    <div class="cart-totals">
      <span>Subtotal</span>
      <span>${money(total)}</span>
    </div>

    <p class="cart-shipping">
      ${icon('truck')} ${shippingMessage}
    </p>

    <button
      type="button"
      class="button button-yellow"
      id="goToCheckout"
    >
      FINALIZAR PEDIDO ${icon('arrow')}
    </button>
  `;
}

function openCart() {
  renderCart();
  openDialog(cartDialog);
}

// FINALIZAÇÃO
function finishOrder() {
  if (!cart.length) {
    notify('Seu carrinho está vazio.');
    return;
  }

  const orderCode =
    'NECO-' + Date.now().toString(36).toUpperCase().slice(-7);

  const order = {
    code: orderCode,
    createdAt: new Date().toISOString(),
    total: cartTotals(),
    count: cartCount(),
    items: cart.map(item => ({ ...item }))
  };

  orders.unshift(order);
  writeStore('NECO_orders_v1', orders);

  cart = [];
  writeStore('NECO_cart_v1', cart);

  updateCartCount();
  closeDialog(cartDialog);

  notify(`Pedido ${orderCode} concluído!`);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

// PERFIL
function openAccount() {
  byId('accountName').value =
    typeof profile.name === 'string' ? profile.name : '';

  byId('orderHistory').innerHTML = `
    <h3>Pedidos demonstrativos</h3>

    ${orders.length
      ? orders.slice(0, 8).map(order => `
        <div class="order-line">
          <span>
            ${escapeHtml(order.code)} ·
            ${new Date(order.createdAt).toLocaleDateString('pt-BR')}
          </span>
          <strong>${money(order.total)}</strong>
        </div>
      `).join('')
      : '<p>Você ainda não concluiu um pedido.</p>'}
  `;

  openDialog(accountDialog);
}

// EVENTOS DA VITRINE
productGrid.addEventListener('click', event => {

  // PRIMEIRO: verifica se o clique foi em uma seta.
  const arrow = event.target.closest('[data-gallery-action]');

  if (arrow) {
    const id = arrow.dataset.galleryId;
    const direction =
      arrow.dataset.galleryAction === 'next' ? 1 : -1;

    changeGallery(id, direction);

    return;
  }

  // Favoritos
  const favorite = event.target.closest('[data-fav-id]');

  if (favorite) {
    toggleFavorite(favorite.dataset.favId);
    return;
  }

  // Abrir detalhes do produto
  const product = event.target.closest('[data-open-id]');

  if (product) {
    openProduct(product.dataset.openId);
  }
});

// Categorias
document.querySelectorAll('[data-category]').forEach(button => {
  button.addEventListener('click', () => {
    setCategory(button.dataset.category);
  });
});

byId('viewAllBtn').addEventListener('click', showAll);
byId('emptyResetBtn').addEventListener('click', showAll);

byId('favoritesBtn').addEventListener('click', () => {
  onlyFavorites = !onlyFavorites;
  category = 'all';
  query = '';

  byId('searchInput').value = '';

  renderProducts();

  byId('produtos').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
});

// Pesquisa
byId('searchInput').addEventListener('input', event => {
  query = event.target.value.trim();
  category = 'all';
  onlyFavorites = false;

  renderProducts();
});

byId('searchForm').addEventListener('submit', event => {
  event.preventDefault();

  byId('searchInput').blur();

  byId('produtos').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
});

// EVENTOS DOS DETALHES DO PRODUTO
productDialog.addEventListener('click', event => {

  const image = event.target.closest('#mainProductImage');

  if (image) {
    image.classList.toggle('is-zoomed');
    return;
  }

  const deltaButton = event.target.closest('[data-detail-qty]');

  if (deltaButton) {
    selectedQty = Math.max(
      1,
      Math.min(
        10,
        selectedQty + Number(deltaButton.dataset.detailQty)
      )
    );

    byId('detailQty').textContent = selectedQty;
    return;
  }

  if (event.target.closest('#addCartBtn')) {

    addToCart(activeProduct.id, selectedQty);

    closeDialog(productDialog);
    openCart();

    notify('Produto adicionado ao carrinho!');
    return;
  }

  if (event.target.closest('#detailFavorite')) {
    toggleFavorite(activeProduct.id);
  }
});

// CARRINHO
byId('cartBtn').addEventListener('click', openCart);

cartDialog.addEventListener('click', event => {

  const remove = event.target.closest('[data-cart-remove]');

  if (remove) {
    const idx = Number(remove.dataset.cartRemove);

    cart.splice(idx, 1);

    writeStore('NECO_cart_v1', cart);
    updateCartCount();
    renderCart();

    notify('Produto removido.');
    return;
  }

  const delta = event.target.closest('[data-cart-delta]');

  if (delta) {
    const [idx, step] =
      delta.dataset.cartDelta.split(':').map(Number);

    if (!cart[idx]) return;

    cart[idx].qty += step;

    if (cart[idx].qty <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].qty = Math.min(99, cart[idx].qty);
    }

    writeStore('NECO_cart_v1', cart);
    updateCartCount();
    renderCart();

    return;
  }

  if (event.target.closest('#continueShopping')) {
    closeDialog(cartDialog);

    byId('produtos').scrollIntoView({
      behavior: 'smooth'
    });
  }

  if (event.target.closest('#goToCheckout')) {
    finishOrder();
  }
});

// PERFIL
byId('accountBtn').addEventListener('click', openAccount);

byId('accountForm').addEventListener('submit', event => {
  event.preventDefault();

  const name = byId('accountName').value.trim();

  if (!name) {
    notify('Digite um nome válido.');
    return;
  }

  profile.name = name;
  writeStore('NECO_profile_v1', profile);

  closeDialog(accountDialog);

  notify(`Perfil local salvo. Olá, ${name.split(' ')[0]}!`);
});

// MENU MOBILE
byId('menuBtn').addEventListener('click', () => {
  const menu = byId('mobileMenu');

  menu.hidden = !menu.hidden;

  byId('menuBtn').setAttribute(
    'aria-expanded',
    String(!menu.hidden)
  );
});

byId('mobileMenu').querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    byId('mobileMenu').hidden = true;

    byId('menuBtn').setAttribute(
      'aria-expanded',
      'false'
    );
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    byId('mobileMenu').hidden = true;

    byId('menuBtn').setAttribute(
      'aria-expanded',
      'false'
    );
  }
});

// INÍCIO
byId('currentYear').textContent =
  String(new Date().getFullYear());

renderProducts();
updateCartCount();
