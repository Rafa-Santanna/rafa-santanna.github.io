
/* KEEP — vitrine de artigos esportivos (front-end demonstrativo)
 * Personalize os produtos no array PRODUCTS. As informações são exemplos.
 * Carrinho, favoritos, perfil e pedidos demonstrativos são salvos no navegador.
 * Pagamentos reais exigem um back-end e um provedor de pagamentos.
 */
'use strict';

const PRODUCTS = [
  {
    id: 'camiseta-movimento', name: 'Bola aaaaaa', price: 84.90,
    category: 'futebol', type: 'Camisetas', image: 'assets/camiseta.png', detailImage: 'assets/camiseta-detalhe.png',
    description: 'Alta durabilidade para garantir muitos momentos em família. A bola aaaaaa sinta a diversão do momento proporcionada pela qualidade da fabricação pensando no seu lazer.',
    sizes: [], color: 'Azul', composition: 'Costura reforçada • produção não-poluente'
  },
  {
    id: 'tenis-street', name: 'Halter', price: 49.90,
    category: 'basquete', type: 'Item', image: 'assets/tenis.png',
    description: 'Halter sextavado de 2kg. Muito confortável e ideal para praticar atividades físicas  fazer',
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43'], color: 'Preto / Multicolorido', composition: 'Estilo casual esportivo'
  },
  {
    id: 'mochila-urbana', name: 'Bicicleta infantil', price: 129.90,
    category: 'skate', type: 'Mochilas', image: 'assets/mochila.png',
    description: 'Bicicleta infantil. Confortável e ideal para passeios e atividades físicas leves. Praticidade e diversão em um único objeto.',
    sizes: ['Único'], color: 'Rosa', composition: 'Modelo urbano • Metal • Ideal para crianças de 8 anos'
  },
  {
    id: 'garrafa-keep', name: 'Garrafa Keep', price: 59.90,
    category: 'corrida', type: 'Acessórios', image: 'assets/garrafa.png',
    description: 'Acompanhe sua rotina de exercícios com a Garrafa Keep. Design compacto e identidade visual exclusiva da coleção Movimento.',
    sizes: ['Único'], color: 'Preto', composition: 'Garrafa reutilizável • tampa rosqueável'
  }
];
const CATEGORY_NAMES = { all: 'Produtos em destaque', futebol: 'Futebol', basquete: 'Basquete', skate: 'Skate', corrida: 'Corrida' };
const byId = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const productById = id => PRODUCTS.find(p => p.id === id);
const FREE_SHIPPING_THRESHOLD = 199;

function readStore(key, fallback) {
  try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback; }
  catch { return fallback; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* A navegação privada pode bloquear armazenamento. */ }
}

let cart = readStore('keep_cart_v1', []);
if (!Array.isArray(cart)) cart = [];
cart = cart.filter(item => productById(item.id) && Number.isInteger(item.qty) && item.qty > 0)
  .map(item => ({ id: item.id, size: String(item.size || 'Único'), qty: Math.min(item.qty, 99) }));
let favorites = readStore('keep_favorites_v1', []);
if (!Array.isArray(favorites)) favorites = [];
favorites = favorites.filter(id => productById(id));
let orders = readStore('keep_orders_v1', []);
if (!Array.isArray(orders)) orders = [];
let profile = readStore('keep_profile_v1', {});
if (!profile || typeof profile !== 'object') profile = {};
let category = 'all';
let onlyFavorites = false;
let query = '';
let activeProduct = null;
let selectedSize = null;
let selectedQty = 1;
let toastTimeout;

const productGrid = byId('productGrid');
const productDialog = byId('productDialog');
const cartDialog = byId('cartDialog');
const accountDialog = byId('accountDialog');
const checkoutDialog = byId('checkoutDialog');
const dialogs = [productDialog, cartDialog, accountDialog, checkoutDialog];

function notify(message) {
  const el = byId('toast');
  clearTimeout(toastTimeout);
  el.textContent = message;
  el.classList.add('is-visible');
  toastTimeout = setTimeout(() => el.classList.remove('is-visible'), 3200);
}

function openDialog(dialog) {
  dialogs.forEach(item => { if (item.open && item !== dialog) item.close(); });
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('modal-open');
}
function closeDialog(dialog) { if (dialog.open) dialog.close(); }
dialogs.forEach(dialog => {
  dialog.addEventListener('close', () => {
    if (!dialogs.some(other => other.open)) document.body.classList.remove('modal-open');
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(dialog); });
  dialog.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => closeDialog(dialog)));
});

function renderProducts() {
  const filtered = PRODUCTS.filter(p => {
    const matchesCategory = category === 'all' || p.category === category;
    const haystack = `${p.name} ${p.category} ${p.type} ${p.description}`.toLocaleLowerCase('pt-BR');
    const matchesQuery = haystack.includes(query.toLocaleLowerCase('pt-BR'));
    return matchesCategory && matchesQuery && (!onlyFavorites || favorites.includes(p.id));
  });
  const heading = onlyFavorites ? 'Meus favoritos' : query ? 'Resultados da pesquisa' : CATEGORY_NAMES[category];
  byId('productsTitle').textContent = heading;
  byId('productsSubtitle').hidden = category === 'all' && !query && !onlyFavorites;
  byId('productsSubtitle').textContent = query ? `BUSCA: ${query}` : 'SELEÇÃO KEEP';
  document.querySelectorAll('[data-category]').forEach(btn => btn.classList.toggle('is-selected', btn.dataset.category === category && category !== 'all'));
  byId('favoritesBtn').classList.toggle('is-active', onlyFavorites);
  byId('favoritesBtn').setAttribute('aria-pressed', String(onlyFavorites));
  productGrid.innerHTML = filtered.map(p => `
    <article class="product-card">
      <button type="button" class="favorite-btn ${favorites.includes(p.id) ? 'is-favorite' : ''}"
        data-fav-id="${p.id}" aria-label="${favorites.includes(p.id) ? 'Remover' : 'Adicionar'} ${p.name} ${favorites.includes(p.id) ? 'dos' : 'aos'} favoritos" aria-pressed="${favorites.includes(p.id)}">
        ${icon('heart')}
      </button>
      <button type="button" class="product-open" data-open-id="${p.id}" aria-label="Ver detalhes de ${p.name}">
        <span class="product-media"><img src="${p.image}" alt="${p.name}" loading="lazy"></span>
        <span class="product-copy"><span class="product-name">${p.name}</span><strong class="product-price">${money(p.price)}</strong></span>
      </button>
    </article>`).join('');
  byId('emptyState').hidden = filtered.length !== 0;
}

function setCategory(next) {
  category = next;
  onlyFavorites = false;
  query = '';
  byId('searchInput').value = '';
  renderProducts();
  byId('produtos').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function showAll() {
  category = 'all'; onlyFavorites = false; query = '';
  byId('searchInput').value = '';
  renderProducts();
  byId('produtos').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function toggleFavorite(id) {
  if (favorites.includes(id)) { favorites = favorites.filter(item => item !== id); notify('Produto removido dos favoritos.'); }
  else { favorites.push(id); notify('Produto salvo nos favoritos!'); }
  writeStore('keep_favorites_v1', favorites);
  renderProducts();
  if (activeProduct?.id === id && productDialog.open) {
    const btn = byId('detailFavorite');
    btn.textContent = favorites.includes(id) ? '♥ Salvo nos favoritos' : '♡ Adicionar aos favoritos';
  }
}

function openProduct(id) {
  activeProduct = productById(id);
  if (!activeProduct) return;
  selectedSize = activeProduct.sizes.length === 1 ? activeProduct.sizes[0] : null;
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
        <span class="gallery-category-label">KEEP / MOVIMENTO</span>
        <img class="main-product-image" id="mainProductImage" src="${p.detailImage || p.image}" alt="Imagem ampliada de ${p.name}" title="Clique para ampliar a imagem">
        <span class="zoom-hint">${icon('zoom')} Clique na imagem para ampliar</span>
      </div>
      <div class="detail-info">
        <p class="detail-eyebrow">${p.type} / KEEP</p>
        <h2 id="detailName">${p.name}</h2>
        <p class="detail-price">${money(p.price)}</p>
        <div class="rating-line" aria-label="Coleção Movimento">★★★★★ <span>Coleção Movimento</span></div>
        <p class="detail-description">${p.description}</p>
        <div class="option-group"><p class="option-title">Cor: ${p.color}</p><div class="color-list"><span class="color-item"><span class="color-dot" aria-hidden="true"></span> ${p.color}</span></div></div>
        
        <div class="option-group"><p class="option-title">${p.sizes[0] === 'Único' ? 'Modelo:' : 'Escolha seu tamanho:'}</p>
          <div class="size-list" aria-label="Tamanhos disponíveis">${p.sizes.map(size => `<button type="button" data-size="${size}" class="size-option ${selectedSize === size ? 'is-selected' : ''}" aria-pressed="${selectedSize === size}">${size}</button>`).join('')}</div>
        </div>
        <div class="qty-row"><p class="option-title" style="margin:0">Quantidade:</p>
          <div class="qty-control"><button type="button" data-detail-qty="-1" aria-label="Diminuir quantidade">${icon('minus')}</button><span id="detailQty">${selectedQty}</span><button type="button" data-detail-qty="1" aria-label="Aumentar quantidade">${icon('plus')}</button></div>
        </div>
        <button type="button" class="button button-yellow detail-add" id="addCartBtn">${icon('cart')} ADICIONAR AO CARRINHO</button>
        <button type="button" class="text-link" id="detailFavorite" style="align-self:flex-start">${favorites.includes(p.id) ? '♥ Salvo nos favoritos' : '♡ Adicionar aos favoritos'}</button>
        <div class="detail-benefits">
          <div class="benefit">${icon('truck')}<span>Frete grátis<small>A partir de R$ 199*</small></span></div>
          <div class="benefit">${icon('box')}<span>Troca fácil<small>Política ilustrativa*</small></span></div>
          <div class="benefit">${icon('shield')}<span>Loja demo<small>Sem cobrança real</small></span></div>
        </div>
      </div>
    </div>`;
}

function addToCart(id, size, qty) {
  const existing = cart.find(item => item.id === id && item.size === size);
  if (existing) existing.qty = Math.min(99, existing.qty + qty);
  else cart.push({ id, size, qty });
  writeStore('keep_cart_v1', cart);
  updateCartCount();
}
function cartTotals() { return cart.reduce((sum, item) => sum + productById(item.id).price * item.qty, 0); }
function cartCount() { return cart.reduce((sum, item) => sum + item.qty, 0); }
function updateCartCount() {
  const count = cartCount();
  byId('cartCount').textContent = count > 99 ? '99+' : String(count);
  byId('cartBtn').setAttribute('aria-label', `Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`);
}
function renderCart() {
  byId('cartHeaderCount').textContent = `(${cartCount()})`;
  if (!cart.length) {
    byId('cartItems').innerHTML = `<div class="cart-empty">${icon('cart')}<h3>Seu carrinho está vazio</h3><p>Que tal escolher seu próximo item da KEEP?</p><button class="button button-dark" id="continueShopping">VER PRODUTOS ${icon('arrow')}</button></div>`;
    byId('cartBottom').innerHTML = '';
    return;
  }
  byId('cartItems').innerHTML = cart.map((item, idx) => {
    const p = productById(item.id);
    return `<div class="cart-item">
      <img src="${p.image}" alt="${p.name}">
      <div><div class="cart-item-head"><div><div class="cart-item-name">${p.name}</div><div class="cart-item-spec">${p.color} · ${item.size}</div></div><button class="cart-remove" data-cart-remove="${idx}" aria-label="Remover ${p.name}">Remover</button></div>
        <div class="cart-item-price">${money(p.price * item.qty)}</div>
        <div class="cart-item-bottom"><div class="qty-control"><button type="button" data-cart-delta="${idx}:-1" aria-label="Diminuir ${p.name}">${icon('minus')}</button><span>${item.qty}</span><button type="button" data-cart-delta="${idx}:1" aria-label="Aumentar ${p.name}">${icon('plus')}</button></div><span class="cart-item-spec">${money(p.price)} / un.</span></div>
      </div>
    </div>`;
  }).join('');
  const total = cartTotals();
  const shippingMessage = total >= FREE_SHIPPING_THRESHOLD ? 'Seu pedido atingiu o valor ilustrativo de frete grátis!' : `Faltam ${money(FREE_SHIPPING_THRESHOLD - total)} para o frete grátis ilustrativo.`;
  byId('cartBottom').innerHTML = `
    <div class="cart-totals"><span>Subtotal</span><span>${money(total)}</span></div>
    <p class="cart-shipping">${icon('truck')} ${shippingMessage}</p>
    <button type="button" class="button button-yellow" id="goToCheckout">FINALIZAR PEDIDO ${icon('arrow')}</button>
    <p class="cart-disclaimer">Simulação: nenhum pagamento será realizado.</p>`;
}
function openCart() { renderCart(); openDialog(cartDialog); }

function openCheckout() {
  if (!cart.length) { notify('Seu carrinho está vazio.'); return; }
  byId('checkoutContent').innerHTML = `
    <p class="section-kicker">FINALIZAÇÃO DEMONSTRATIVA</p><h2 id="checkoutTitle">Revisar pedido</h2>
    <p class="subtle">Nenhum pagamento será cobrado e nenhum pedido será enviado. Este formulário simula a compra apenas neste navegador.</p>
    <div id="checkoutSummary" class="checkout-summary"><span>${cartCount()} ${cartCount() === 1 ? 'item' : 'itens'}</span><strong>${money(cartTotals())}</strong></div>
    <form id="checkoutForm" class="form-stack">
      <label for="checkoutName">Nome completo<input id="checkoutName" name="name" autocomplete="name" required minlength="3" maxlength="100" placeholder="Seu nome"></label>
      <label for="checkoutEmail">E-mail<input id="checkoutEmail" name="email" type="email" autocomplete="email" required placeholder="voce@exemplo.com"></label>
      <button type="submit" class="button button-yellow">CONCLUIR SIMULAÇÃO ${icon('arrow')}</button>
    </form>`;
  const nameInput = byId('checkoutName');
  if (typeof profile.name === 'string') nameInput.value = profile.name;
  openDialog(checkoutDialog);
}
function submitCheckout(event) {
  event.preventDefault();
  const form = event.target;
  if (!form.reportValidity() || !cart.length) return;
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  if (!name || !email) { notify('Preencha os dados para continuar.'); return; }
  const orderCode = 'KEEP-' + Date.now().toString(36).toUpperCase().slice(-7);
  const order = { code: orderCode, createdAt: new Date().toISOString(), total: cartTotals(), count: cartCount(), items: cart.map(item => ({ ...item })) };
  orders.unshift(order);
  writeStore('keep_orders_v1', orders);
  profile.name = name;
  writeStore('keep_profile_v1', profile);
  cart = [];
  writeStore('keep_cart_v1', cart);
  updateCartCount();
  // Nome e e-mail não são enviados. O e-mail é usado somente durante o formulário.
  byId('checkoutContent').innerHTML = `<div class="success-panel"><span class="success-check">${icon('check')}</span><p class="section-kicker">SIMULAÇÃO CONCLUÍDA</p><h2 id="checkoutTitle">Tudo certo, ${escapeHtml(name.split(' ')[0])}!</h2><p class="subtle">Seu pedido demonstrativo <strong>${orderCode}</strong> foi salvo neste navegador. Nenhuma compra real foi feita e nenhum e-mail será enviado.</p><button type="button" class="button button-dark" id="finishCheckout">VOLTAR À LOJA ${icon('arrow')}</button></div>`;
}
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function openAccount() {
  byId('accountName').value = typeof profile.name === 'string' ? profile.name : '';
  byId('orderHistory').innerHTML = `<h3>Pedidos demonstrativos</h3>${orders.length ? orders.slice(0, 8).map(order => `<div class="order-line"><span>${escapeHtml(order.code)} · ${new Date(order.createdAt).toLocaleDateString('pt-BR')}</span><strong>${money(order.total)}</strong></div>`).join('') : '<p>Você ainda não concluiu uma simulação de pedido.</p>'}`;
  openDialog(accountDialog);
}

// Eventos da vitrine
productGrid.addEventListener('click', event => {
  const favorite = event.target.closest('[data-fav-id]');
  if (favorite) { toggleFavorite(favorite.dataset.favId); return; }
  const product = event.target.closest('[data-open-id]');
  if (product) openProduct(product.dataset.openId);
});
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => setCategory(button.dataset.category)));
byId('viewAllBtn').addEventListener('click', showAll);
byId('emptyResetBtn').addEventListener('click', showAll);
byId('favoritesBtn').addEventListener('click', () => {
  onlyFavorites = !onlyFavorites;
  category = 'all'; query = ''; byId('searchInput').value = '';
  renderProducts();
  byId('produtos').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
byId('searchInput').addEventListener('input', event => {
  query = event.target.value.trim();
  category = 'all'; onlyFavorites = false;
  renderProducts();
});
byId('searchForm').addEventListener('submit', event => {
  event.preventDefault();
  byId('searchInput').blur();
  byId('produtos').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Eventos do produto
productDialog.addEventListener('click', event => {
  const image = event.target.closest('#mainProductImage');
  if (image) { image.classList.toggle('is-zoomed'); return; }
  const sizeButton = event.target.closest('[data-size]');
  if (sizeButton) {
    selectedSize = sizeButton.dataset.size;
    productDialog.querySelectorAll('[data-size]').forEach(btn => {
      const chosen = btn.dataset.size === selectedSize;
      btn.classList.toggle('is-selected', chosen);
      btn.setAttribute('aria-pressed', String(chosen));
    });
    return;
  }
  const deltaButton = event.target.closest('[data-detail-qty]');
  if (deltaButton) {
    selectedQty = Math.max(1, Math.min(10, selectedQty + Number(deltaButton.dataset.detailQty)));
    byId('detailQty').textContent = selectedQty;
    return;
  }
  if (event.target.closest('#addCartBtn')) {
    if (!selectedSize) { notify('Selecione um tamanho antes de adicionar ao carrinho.'); return; }
    addToCart(activeProduct.id, selectedSize, selectedQty);
    closeDialog(productDialog);
    openCart();
    notify('Produto adicionado ao carrinho!');
    return;
  }
  if (event.target.closest('#detailFavorite')) toggleFavorite(activeProduct.id);
});
byId('cartBtn').addEventListener('click', openCart);
cartDialog.addEventListener('click', event => {
  const remove = event.target.closest('[data-cart-remove]');
  if (remove) {
    const idx = Number(remove.dataset.cartRemove);
    cart.splice(idx, 1);
    writeStore('keep_cart_v1', cart); updateCartCount(); renderCart(); notify('Produto removido.');
    return;
  }
  const delta = event.target.closest('[data-cart-delta]');
  if (delta) {
    const [idx, step] = delta.dataset.cartDelta.split(':').map(Number);
    if (!cart[idx]) return;
    cart[idx].qty += step;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    else cart[idx].qty = Math.min(99, cart[idx].qty);
    writeStore('keep_cart_v1', cart); updateCartCount(); renderCart();
    return;
  }
  if (event.target.closest('#continueShopping')) { closeDialog(cartDialog); byId('produtos').scrollIntoView({ behavior: 'smooth' }); }
  if (event.target.closest('#goToCheckout')) openCheckout();
});
checkoutDialog.addEventListener('submit', event => { if (event.target.id === 'checkoutForm') submitCheckout(event); });
checkoutDialog.addEventListener('click', event => { if (event.target.closest('#finishCheckout')) closeDialog(checkoutDialog); });
byId('accountBtn').addEventListener('click', openAccount);
byId('accountForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = byId('accountName').value.trim();
  if (!name) { notify('Digite um nome válido.'); return; }
  profile.name = name;
  writeStore('keep_profile_v1', profile);
  closeDialog(accountDialog);
  notify(`Perfil local salvo. Olá, ${name.split(' ')[0]}!`);
});

// Menu mobile
byId('menuBtn').addEventListener('click', () => {
  const menu = byId('mobileMenu');
  menu.hidden = !menu.hidden;
  byId('menuBtn').setAttribute('aria-expanded', String(!menu.hidden));
});
byId('mobileMenu').querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  byId('mobileMenu').hidden = true;
  byId('menuBtn').setAttribute('aria-expanded', 'false');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    byId('mobileMenu').hidden = true;
    byId('menuBtn').setAttribute('aria-expanded', 'false');
  }
});

// Início
byId('currentYear').textContent = String(new Date().getFullYear());
renderProducts();
updateCartCount();
