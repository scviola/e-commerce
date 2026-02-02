//safaricom webhook callback

const Order = require('../controllers/orderController');
const Payment = require('../controllers/paymentController');

const mpesaCallback = async (req, res) => {
    try {
        const callback = req.body.Body.stkCallback;

        const checkoutRequestId = callback.CheckoutRequestID;
        const resultCode = callback.ResultCode;

        const payment = await Payment.findOne({checkoutRequestId});
        if (!payment) {
            return res.status(404).json({message: "Payment not found"});
        }

        //payment failed/cancelled
        if (resultCode !== 0) {
            payment.status = "Failed";
            await payment.save();

            return res.status(200).json({message: "Payment failed"});
        }

        //payment succeeded
        const metadata = callback.callbackMetadata.Item;
        //extract mpesa receipt number
        const receipt = metadata.find((item) => item.Name === "MpesaReceiptNumber")?.value;

        payment.status = "Completed";
        payment.transactionId = receipt;
        payment.paidAt = new Date();

        await payment.save();

        //update order status
        await Order.findByIdAndUpdate(
            payment.order, 
            { paymentStatus: "Paid", 
              orderStatus: "Processing"
            }
        );

        return res.status(200).json({message: "Payment completed successfully"});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


module.exports = mpesaCallback;