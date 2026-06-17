const sampleTransactions = [
  { date: '2026-06-12', description: 'AMAZON.COM ELECTRONICS REQ', amount: 154.20, type: 'expense', category: 'Shopping' },
  { date: '2026-06-10', description: 'SHELL OIL GAS STATION STMT', amount: 45.00, type: 'expense', category: 'Transportation' },
  { date: '2026-06-08', description: 'SAFEWAY GROCERY STORES', amount: 112.50, type: 'expense', category: 'Food & Groceries' },
  { date: '2026-06-05', description: 'NETFLIX MOVIE SUBSCRIPTION', amount: 15.49, type: 'expense', category: 'Utilities & Bills' },
  { date: '2026-06-03', description: 'STARBUCKS COFFEE OUTLET', amount: 18.25, type: 'expense', category: 'Entertainment & Dining' },
  { date: '2026-06-01', description: 'STRIPE DIRECT DEPOSIT PAYROLL', amount: 3200.00, type: 'income', category: 'Savings' },
  { date: '2026-05-28', description: 'METROPOLITAN APTS RENT', amount: 1400.00, type: 'expense', category: 'Housing' }
];

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json(sampleTransactions);
}
