const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
const stripe = Stripe("sk_test_TA_CLE_SECRETE_ICI");

app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req,res)=>{
    const { cart } = req.body;

    const line_items = cart.map(item => ({
        price_data:{
            currency:"eur",
            product_data:{ name: item.name },
            unit_amount: item.price * 100
        },
        quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types:["card"],
        line_items,
        mode:"payment",
        success_url:"http://localhost:5500/success.html",
        cancel_url:"http://localhost:5500/panier.html"
    });

    res.json({ id: session.id });
});

app.listen(4242, ()=>console.log("Stripe server running"));
