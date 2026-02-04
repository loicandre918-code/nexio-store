// Checkout JS
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function init() {
    if (cart.length === 0) {
        window.location.href = 'index.html';
        return;
    }
    renderSummary();
}

function renderSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 0;
    const total = subtotal + shipping;
    
    summaryItems.innerHTML = cart.map(item => `
        <div class="summary-item">
            <div class="summary-item-image">${item.icon}</div>
            <div style="flex:1;">
                <div style="font-weight:600;margin-bottom:.3rem;">${item.name}</div>
                <div style="color:#6b7280;font-size:.9rem;">Quantité: ${item.quantity}</div>
            </div>
            <div style="font-weight:bold;color:#6366f1;">${(item.price * item.quantity).toFixed(2)}€</div>
        </div>
    `).join('');
    
    document.getElementById('summarySubtotal').textContent = subtotal.toFixed(2) + ' €';
    document.getElementById('summaryShipping').textContent = shipping === 0 ? 'GRATUIT' : shipping.toFixed(2) + ' €';
    document.getElementById('summaryTotal').textContent = total.toFixed(2) + ' €';
}

function processPayment() {
    const form = document.getElementById('checkoutForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const orderNumber = Math.floor(Math.random() * 90000) + 10000;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = {
        orderNumber: orderNumber,
        date: new Date().toLocaleDateString('fr-FR'),
        items: cart,
        total: subtotal,
        customer: {
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            email: form.email.value
        }
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(order));
    localStorage.removeItem('cart');
    window.location.href = 'confirmation.html';
}

init();
