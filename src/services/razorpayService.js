import RazorpayCheckout from 'react-native-razorpay';

const RAZORPAY_KEY = 'rzp_test_RYbGAy70sU3V0B';

export const initiateRazorpayPayment = async (razorpayOrder) => {
  return new Promise((resolve, reject) => {
    const options = {
      description: 'Keeva Order',
      image: 'https://api.keeva.in/logo.png',
      currency: razorpayOrder.currency,
      key: RAZORPAY_KEY,
      amount: razorpayOrder.amount,
      order_id: razorpayOrder.id,
      name: 'Keeva',
      prefill: {
        email: 'contact@keeva.in',
        contact: '9999999999',
      },
      theme: { color: 'rgb(42,145,52)' },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        resolve({
          success: true,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature,
        });
      })
      .catch((error) => {
        reject({
          success: false,
          error: error.description || 'Payment cancelled',
          code: error.code,
        });
      });
  });
};
