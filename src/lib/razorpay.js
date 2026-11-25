let razorpayScriptPromise = null;

export function loadRazorpayScript() {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      razorpayScriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export async function openRazorpayCheckout({
  keyId,
  orderId,
  amount,
  currency = 'INR',
  orderRef,
  customerName,
  phone
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error('Could not load Razorpay Checkout. Please check your connection and retry.');
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency,
      name: 'Kushi Dairy Products',
      description: `Order ${orderRef} · Chaparam, Srikakulam`,
      order_id: orderId,
      prefill: {
        name: customerName,
        contact: `+91${phone}`
      },
      theme: {
        color: '#1256A8'
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment was cancelled. You can retry anytime.'));
        }
      },
      handler: (response) => {
        resolve(response);
      }
    });

    rzp.on('payment.failed', (resp) => {
      const msg =
        resp?.error?.description ||
        'Payment failed. Please try again or use another payment method.';
      reject(new Error(msg));
    });

    rzp.open();
  });
}
