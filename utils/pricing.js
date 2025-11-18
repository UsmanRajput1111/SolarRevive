export const SERVICE_PRICING = {
  'Solar Panel Cleaning': 2000,
  'Solar Panel Installation': 2500,
  'Solar Foundation': 1500,
};

export const SUBSCRIPTION_PRICE = 12000;

export function calculateAmountDue(serviceType, hasSubscription = false) {
  const basePrice = SERVICE_PRICING[serviceType] ?? 0;

  if (serviceType === 'Solar Panel Cleaning') {
    return hasSubscription ? SUBSCRIPTION_PRICE : basePrice;
  }

  return basePrice;
}

