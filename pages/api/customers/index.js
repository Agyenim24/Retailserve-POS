// pages/api/customers/index.js
import { store } from '../../../lib/store';
import { requireAuth } from '../../../lib/auth';
import { customerSchema } from '../../../lib/validations';

export default async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    const { search } = req.query;
    const customers = await store.getCustomers(search);
    return res.status(200).json(customers);
  }

  if (req.method === 'POST') {
    try {
      const data = customerSchema.parse(req.body);
      const newCustomer = await store.createCustomer(data);
      return res.status(201).json(newCustomer);
    } catch (error) {
      return res.status(400).json({ error: error.errors || error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
