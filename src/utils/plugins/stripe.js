import runtimeVariables from '../../../public/config.js';

export default {
  addStripe: (onFinish) => {
    if (!runtimeVariables.get('VUE_APP_BOTHUB_WEBAPP_PAYMENT_ENABLED') || document.getElementById('stripe-script')) {
      onFinish();
      return;
    }
    const script = document.createElement('script');
    script.id = 'stripe-script';
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = onFinish;
    document.head.appendChild(script);
  },
};
