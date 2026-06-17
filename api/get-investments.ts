const mockInvestments = {
  analysis: 'A balanced, moderate strategy that blends high liquidity savings with steady blue-chip global equity indices to safely accelerate your asset base.',
  recommendedAllocation: [
    {
      name: 'Broad Market S&P 500 Index Funds (ETF)',
      type: 'Equities / Global Stocks',
      expectedReturn: '8.0% - 10.0% average',
      riskLevel: 'Medium',
      minimumTimeline: '3 - 5 Years',
      allocationPercentage: 55,
      pros: ['Massive exposure to America\'s 500 top corporations', 'Very low fee ratios', 'Outstanding historical record of building wealth'],
      cons: ['Short-term price volatility', 'Requires holding during economic drops'],
      summary: 'The single best long-term investment vehicle for beginners of all ages to build substantial compound compounding wealth.'
    },
    {
      name: 'High-Yield Savings Account (HYSA)',
      type: 'Cash Equivalents',
      expectedReturn: '4.2% - 5.0% APY',
      riskLevel: 'Low',
      minimumTimeline: 'Immediate / No lockup',
      allocationPercentage: 35,
      pros: ['100% principal safety', 'Liquid cushion for immediate goals', 'No volatility'],
      cons: ['Returns cannot match equities long term'],
      summary: 'Keeps your buffer capital liquid so you are never forced to sell stocks at a loss in a market dip.'
    },
    {
      name: 'Short-Term High Quality Corporate Bonds',
      type: 'Fixed Income',
      expectedReturn: '5.5% - 6.2%',
      riskLevel: 'Medium',
      minimumTimeline: '1 - 2 Years',
      allocationPercentage: 10,
      pros: ['Higher income yield than treasury bills', 'Relatively stable performance'],
      cons: ['Extremely minor structural credit default risk'],
      summary: 'Provides an elevated fixed-interest return stream with less volatile swings than stock indexes.'
    }
  ],
  learningCorners: [
    { term: 'ETF (Exchange-Traded Fund)', definition: 'An investment basket that lets you purchase hundreds representing shares of different corporations simultaneously with one single click.' },
    { term: 'Volatily Risk', definition: 'The regular, normal minor ups and downs of asset values on the global stock market in any given week or month.' }
  ]
};

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json(mockInvestments);
}
