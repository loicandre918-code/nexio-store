const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51SNceXQwQKy3CH6FIliiVHEVVnYCY68G3y5kSJYKW98sgRVDMDK2bpGHp4JTEsgCzy0ncMFiMdA7y8nWLeiGJ6Zu00937bPKJb');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Route pour créer une session Stripe Checkout
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { cart } = req.body;

        // Validation du panier
        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: 'Panier vide' });
        }

        // LOG DE DÉBOGAGE - Affiche ce qui est reçu
        console.log('📦 Panier reçu:', JSON.stringify(cart, null, 2));

        // Conversion des articles du panier en format Stripe
        const lineItems = cart.map(item => {
            const productData = {
                name: item.name || 'Produit',
            };
            
            // ⚠️ CORRECTION IMPORTANTE : N'ajouter la description que si elle existe ET n'est pas vide
            if (item.description && 
                typeof item.description === 'string' && 
                item.description.trim() !== '') {
                productData.description = item.description.trim();
            }
            // Si description est vide ou n'existe pas, on ne l'ajoute pas du tout
            
            return {
                price_data: {
                    currency: 'eur',
                    product_data: productData,
                    unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
                },
                quantity: item.quantity || 1,
            };
        });

        // LOG DE DÉBOGAGE - Affiche ce qui sera envoyé à Stripe
        console.log('💳 Line items pour Stripe:', JSON.stringify(lineItems, null, 2));

        // Création de la session Stripe Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/panier.html`,
            shipping_address_collection: {
                allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'],
            },
            billing_address_collection: 'required',
        });

        console.log('✅ Session Stripe créée avec succès:', session.id);
        res.json({ id: session.id });

    } catch (error) {
        console.error('❌ Erreur Stripe:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Route pour vérifier le statut d'un paiement
app.get('/payment-status/:sessionId', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        res.json({
            status: session.payment_status,
            customer_email: session.customer_details?.email
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook pour les événements Stripe (optionnel mais recommandé)
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = 'whsec_VOTRE_WEBHOOK_SECRET'; // À obtenir dans le dashboard Stripe

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
    }

    // Gérer les événements
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('✅ Paiement réussi:', session.id);
            // Ici vous pouvez :
            // - Envoyer un email de confirmation
            // - Mettre à jour votre base de données
            // - Déclencher la livraison
            break;

        case 'payment_intent.payment_failed':
            console.log('❌ Paiement échoué');
            break;

        default:
            console.log(`Événement non géré: ${event.type}`);
    }

    res.json({received: true});
});

// Démarrage du serveur
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📝 Remplacez votre clé secrète Stripe si nécessaire`);
    console.log(`🔍 Mode débogage activé - vérifiez les logs pour diagnostiquer`);
});
