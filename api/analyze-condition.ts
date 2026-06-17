function getMockBudgetAdvice(monthlyIncome: number, fixedExpenses: number, variableExpenses: number, targetGoal: number) {
  const currentMonthlySavings = Math.max(0, monthlyIncome - fixedExpenses - variableExpenses);
  const recommendedSavings = Math.round(targetGoal / 12);
  const monthsToGoal = currentMonthlySavings > 0 ? Math.ceil(targetGoal / currentMonthlySavings) : 999;

  return {
    analysis: 'Your fixed costs constitute a large portion of your income, but you have space to trim variable spending to reach your goal. Consistency is your primary lever.',
    suggestedBudget: [
      {
        category: 'Housing',
        allocatedPercentage: Math.round((fixedExpenses * 0.6 / monthlyIncome) * 100) || 30,
        allocatedAmount: Math.round(fixedExpenses * 0.6) || 900,
        tips: 'Review utility contracts or look into roommates to offset housing overheads.'
      },
      {
        category: 'Needs & Daily Bills',
        allocatedPercentage: Math.round((fixedExpenses * 0.4 / monthlyIncome) * 100) || 20,
        allocatedAmount: Math.round(fixedExpenses * 0.4) || 600,
        tips: "Audit recurring subscriptions and cancel any that haven't been used in 30 days."
      },
      {
        category: 'Food & Fun',
        allocatedPercentage: Math.round((variableExpenses / monthlyIncome) * 100) || 15,
        allocatedAmount: Math.round(variableExpenses * 0.7) || 450,
        tips: 'Plan your meals, utilize grocery pick-up services to avoid impulse purchases, and limit dine-out occasions to twice a week.'
      },
      {
        category: 'Savings & Investment',
        allocatedPercentage: Math.round(((monthlyIncome - (fixedExpenses + variableExpenses * 0.7)) / monthlyIncome) * 100) || 35,
        allocatedAmount: Math.round(monthlyIncome - (fixedExpenses + variableExpenses * 0.7)) || 1050,
        tips: 'Directly auto-transfer this sum of money into a High-Yield Savings Account the morning your salary deposits.'
      }
    ],
    savingsProgressEstimate: {
      monthsToGoal: monthsToGoal === 999 ? 36 : monthsToGoal,
      achievableByTarget: monthsToGoal <= 12,
      recommendedMonthlySavings: recommendedSavings,
      currentMonthlySavings: currentMonthlySavings
    },
    keyActionPlan: [
      'Set up automatic payments to clear high-rate high bills first.',
      'Move emergency funds to an FDIC-insured High-Yield Savings Account (yielding 4%+ APY).',
      'Establish a weekly spending check-in every Sunday for 10 minutes to stay within boundaries.'
    ]
  };
}

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const monthlyIncome = Number(body.monthlyIncome || 0);
    const fixedExpenses = Number(body.fixedExpenses || 0);
    const variableExpenses = Number(body.variableExpenses || 0);
    const targetAmount = Number(body.targetAmount || 5000);

    if (!Number.isFinite(monthlyIncome) || !Number.isFinite(fixedExpenses) || !Number.isFinite(variableExpenses)) {
      return res.status(400).json({ error: 'Missing essential financial parameters' });
    }

    return res.status(200).json(
      getMockBudgetAdvice(monthlyIncome, fixedExpenses, variableExpenses, targetAmount)
    );
  } catch (error) {
    return res.status(500).json({ error: 'Failed to analyze condition' });
  }
}
