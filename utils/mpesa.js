//token function
const axios = require('axios');

const getMpesaToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const response = await axios.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        { headers: 
            { Authorization: `Basic ${auth}` }
        }
    );

    return response.data.access_token;
};


//stk push fuction
const initiateSTKPush = async ({phoneNumber, amount, orderId}) => {
    const token = await getMpesaToken();

    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);

    const password = Buffer.from(
        process.env.MPESA_SHORTCODE + 
        process.env.MPESA_PASSKEY +
        timestamp).toString("base64");

    const response = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: process.env.MPESA_SHORTCODE,
            Phone: phoneNumber,
            CallBackURL: process.env.MPESA_CALLBACK_URL,
            AccountReference: orderId,
            TransactionDesc: "Order Payment"
        },
        { headers:
            {Authorization: `Bearer ${token}`}
        }
    );

    return response.data;
};


module.exports = { getMpesaToken, initiateSTKPush };