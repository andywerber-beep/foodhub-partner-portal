import Stripe from 'stripe';

// Initialize the Stripe engine block using secure system environment parameters
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_until_you_subscribe';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-06-24.dahlia', // Aligned exactly with the library's required build version
  typescript: true,
});

/**
 * Helper utility to calculate your explicit 10% platform commission on transactions.
 * Total amount must be provided in the smallest currency unit (pence for GBP).
 */
export function calculatePlatformCommission(amountInPence: number): number {
  const commissionRate = 0.10; // Strict 10% commission allocation
  return Math.round(amountInPence * commissionRate);
}
