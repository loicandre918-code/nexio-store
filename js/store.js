// Store JS - Boutique complète
const products = [
    {id:1,name:"Smartwatch Pro",category:"electronique",price:89.99,oldPrice:129.99,description:"Montre connectée avec suivi d'activité complet",icon:"⌚",badge:"PROMO"},
    {id:2,name:"Écouteurs Bluetooth",category:"electronique",price:49.99,description:"Son HD, réduction de bruit active",icon:"🎧"},
    {id:3,name:"T-Shirt Premium",category:"vetements",price:24.99,description:"Coton bio 100%, confort optimal",icon:"👕"},
    {id:4,name:"Bouteille Isotherme",category:"sport",price:19.99,description:"Garde le chaud 12h, le froid 24h",icon:"🍾"},
    {id:5,name:"Lampe LED Smart",category:"maison",price:34.99,description:"16M couleurs, contrôle app",icon:"💡"},
    {id:6,name:"Tapis Yoga Premium",category:"sport",price:29.99,description:"Antidérapant, épaisseur 6mm",icon:"🧘"},
    {id:7,name:"Casque Gaming RGB",category:"electronique",price:79.99,oldPrice:99.99,description:"Son surround 7.1, micro antibruit",icon:"🎮",badge:"TOP"},
    {id:8,name:"Sac à Dos Moderne",category:"vetements",price:44.99,description:"Port USB, compartiment laptop",icon:"🎒"},
    {id:9,name:"Balance Connectée",category:"beaute",price:39.99,description:"Analyse masse musculaire/graisseuse",icon:"⚖️"},
    {id:10,name:"Cafetière Italienne",category:"maison",price:27.99,description:"Aluminium, 6 tasses",icon:"☕"},
    {id:11,name:"Bandes Résistance",category:"sport",price:16.99,description:"5 niveaux, latex naturel",icon:"💪"},
    {id:12,name:"Trousse Maquillage",category:"beaute",price:18.99,description:"Kit complet, miroir LED inclus",icon:"💄"}
];

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let filteredProducts = [...products];

function init() {
    renderProducts();
    updateCartBadge();
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = filteredProducts.map(p => `
        <div class="product-card" onclick="showProductModal(${p.id})">
            <div class="product-image">
                ${p.icon}
                ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${p.category}</div>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-description">${p.description}</p>
                <div class="product-footer">
                    <div>
                        ${p.oldPrice ? `<span class="product-old-price">${p.oldPrice.toFixed(2)}€</span>` : ''}
                        <div class="product-price">${p.price.toFixed(2)}€</div>
                    </div>
                    <button class="btn-add-cart" onclick="event.stopPropagation();addToCart(${p.id})">
                        Ajouter
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const sort = document.getElementById('sortFilter')?.value || 'featured';
    const maxPrice = parseFloat(document.getElementById('priceFilter')?.value) || Infinity;
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    filteredProducts = products.filter(p => {
        const matchCategory = category === 'all' || p.category === category;
        const matchPrice = p.price <= maxPrice;
        const matchSearch = p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm);
        return matchCategory && matchPrice && matchSearch;
    });
    
    if (sort === 'price-asc') filteredProducts.sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') filteredProducts.sort((a,b) => b.price - a.price);
    if (sort === 'name') filteredProducts.sort((a,b) => a.name.localeCompare(b.name));
    
    renderProducts();
}

function searchProducts() {
    filterProducts();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    saveCart();
    updateCartBadge();
    showToast('✅ Produit ajouté au panier !');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    updateCartBadge();
}

function updateQuantity(productId, delta) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += delta;
        if (cartItem.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
        }
    }
}

function toggleCart() {
    const overlay = document.getElementById('cartOverlay');
    const sidebar = document.getElementById('cartSidebar');
    overlay.classList.toggle('active');
    sidebar.classList.toggle('active');
    renderCart();
}

function closeCart() {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartSidebar').classList.remove('active');
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div style="text-align:center;padding:3rem;color:#9ca3af;"><div style="font-size:4rem;">🛒</div><p>Votre panier est vide</p></div>';
        document.getElementById('cartSubtotal').textContent = '0.00 €';
        document.getElementById('cartShipping').textContent = 'GRATUIT';
        document.getElementById('cartTotal').textContent = '0.00 €';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.icon}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toFixed(2)} €</div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="qty-btn" onclick="removeFromCart(${item.id})" style="margin-left:auto;">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 0;
    const total = subtotal + shipping;
    
    document.getElementById('cartSubtotal').textContent = subtotal.toFixed(2) + ' €';
    document.getElementById('cartShipping').textContent = shipping === 0 ? 'GRATUIT' : shipping.toFixed(2) + ' €';
    document.getElementById('cartTotal').textContent = total.toFixed(2) + ' €';
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = count;
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function goToCheckout() {
    if (cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }
    window.location.href = 'checkout.html';
}

function showProductModal(productId) {
    const product = products.find(p => p.id === productId);
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('productModalBody');
    
    modalBody.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;">
            <div>
                <div style="width:100%;height:400px;background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:10rem;">${product.icon}</div>
            </div>
            <div>
                <div style="color:#6366f1;font-size:.9rem;font-weight:600;text-transform:uppercase;margin-bottom:.5rem;">${product.category}</div>
                <h2 style="font-size:2rem;margin-bottom:1rem;">${product.name}</h2>
                <p style="color:#6b7280;margin-bottom:2rem;line-height:1.8;">${product.description}</p>
                <div style="margin-bottom:2rem;">
                    ${product.oldPrice ? `<span style="text-decoration:line-through;color:#6b7280;font-size:1.2rem;margin-right:.5rem;">${product.oldPrice.toFixed(2)}€</span>` : ''}
                    <span style="font-size:2.5rem;font-weight:bold;color:#6366f1;">${product.price.toFixed(2)}€</span>
                </div>
                <button onclick="addToCart(${product.id});closeProductModal();" style="width:100%;padding:1.2rem;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#fff;border:none;border-radius:8px;font-weight:600;font-size:1.1rem;cursor:pointer;">
                    Ajouter au panier
                </button>
                <div style="margin-top:2rem;padding:1.5rem;background:#f9fafb;border-radius:8px;">
                    <h4 style="margin-bottom:1rem;">Informations</h4>
                    <div style="display:flex;flex-direction:column;gap:.5rem;font-size:.9rem;">
                        <div>✓ Livraison gratuite dès 50€</div>
                        <div>✓ Retours sous 30 jours</div>
                        <div>✓ Paiement sécurisé</div>
                        <div>✓ Garantie 2 ans</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function subscribeNewsletter(event) {
    event.preventDefault();
    showToast('✅ Merci pour votre inscription !');
    event.target.reset();
}

init();
