// Confirmation JS
const order = JSON.parse(localStorage.getItem('lastOrder') || '{}');

function init() {
    if (!order.orderNumber) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('orderNumber').textContent = '#' + order.orderNumber;
    document.getElementById('orderDate').textContent = order.date;
    document.getElementById('orderTotal').textContent = order.total.toFixed(2) + ' €';
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    document.getElementById('deliveryDate').textContent = deliveryDate.toLocaleDateString('fr-FR');
    
    const orderItemsList = document.getElementById('orderItemsList');
    orderItemsList.innerHTML = order.items.map(item => `
        <div style="display:flex;gap:1rem;padding:1rem;background:#f9fafb;border-radius:8px;margin-bottom:1rem;">
            <div style="width:60px;height:60px;background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;">${item.icon}</div>
            <div style="flex:1;">
                <div style="font-weight:600;">${item.name}</div>
                <div style="color:#6b7280;font-size:.9rem;">Quantité: ${item.quantity}</div>
            </div>
            <div style="font-weight:bold;color:#6366f1;">${(item.price * item.quantity).toFixed(2)}€</div>
        </div>
    `).join('');
}

init();
