// pages/api/paystack/verify.js
import { requireAuth } from '../../../lib/auth';

/**
 * SECURE SERVER-SIDE PAYSTACK VERIFICATION
 * This endpoint verifies a transaction reference directly with Paystack's API
 * using the secret key, ensuring the client-side success callback wasn't spoofed.
 */
export default async function handler(req, res) {
  // 1. Ensure the user is actually logged into the POS system
  const session = await requireAuth(req, res);
  if (!session) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ error: 'Transaction reference is required' });
  }

  try {
    // 2. Call Paystack Verification API
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await paystackRes.json();

    if (!paystackRes.ok) {
      throw new Error(data.message || 'Verification request failed');
    }

    // 3. Check if transaction was actually successful
    if (data.data.status === 'success') {
      return res.status(200).json({ 
        verified: true, 
        data: data.data 
      });
    } else {
      return res.status(400).json({ 
        verified: false, 
        message: `Transaction status is ${data.data.status}` 
      });
    }

  } catch (error) {
    console.error('Paystack Verification Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
