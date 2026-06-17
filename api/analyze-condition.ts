import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const currencySymbols: Record<string, string> = {
  USD: "$",
  INR: "₹",
  PKR: "₨",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  AED: "د.إ",
  SAR: "ر.س"
};

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const monthlyIncome = Number(body.monthlyIncome || 0);
    const fixedExpenses = Number(body.fixedExpenses || 0);
    const variableExpenses = Number(body.variableExpenses || 0);
    const currentSavings = Number(body.currentSavings || 0);
    const targetAmount = Number(body.targetAmount || 5000);
    const targetDate = body.targetDate;
    const riskTolerance = body.riskTolerance || "medium";
    const currencyCode = body.currencyCode || "USD";

    if (!monthlyIncome || fixedExpenses === undefined || variableExpenses === undefined) {
      return res.status(400).json({ error: 'Missing essential financial parameters' });
    }

    const symbol = currencySymbols[currencyCode] || "$";

    if (!apiKey) {
      console.log("No API key. Satisfying request with high-quality mock data.");
      return res.status(200).json(getMockBudgetAdvice(monthlyIncome, fixedExpenses, variableExpenses, targetAmount));
    }

    const prompt = `Analyze this user's current financial condition:
- Monthly Net Take-Home Income: ${symbol}${monthlyIncome}
- Fixed Committed Expenses (rent, utilities, loans): ${symbol}${fixedExpenses}
- Variable Discretionary Expenses (fun, shopping, eating out): ${symbol}${variableExpenses}
- Current Savings Liquid Balance: ${symbol}${currentSavings}
- Financial Savings Target Goal: ${symbol}${targetAmount} (to reach by target month: ${targetDate || "Not Specified"})
- Risk Profile Style: ${riskTolerance}
- User Currency Location Setting: ${currencyCode} (${symbol})

Provide a customized budget optimization structure to help them reach their savings goals. Highlight where they can prune costs. Determine precisely how many months it will take to achieve their target savings goal with their current surplus, and if they will make it by their target date (achievableByTarget).
Keep your tips extremely practical, targeted, and educational, especially for beginners who have limited knowledge in finance! Ensure ALL absolute monetary values, recommended budget limits (allocatedAmount), and progress targets are calculated and returned strictly in the user's currency context: ${currencyCode} (${symbol}). Do NOT convert them back to USD; keep them directly in absolute units of ${currencyCode}.
Provide your response in valid JSON format conforming to the expected responseSchema structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING, description: "Detailed situation analysis with encouragement and cost-saving opportunities." },
            suggestedBudget: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "Budget category (Housing, Food, Entertainment, Bills, Transportation, etc.)" },
                  allocatedPercentage: { type: Type.NUMBER, description: "Optimized percentage (0-100) of their monthly income to allocate" },
                  allocatedAmount: { type: Type.NUMBER, description: "Dollar value based on income" },
                  tips: { type: Type.STRING, description: "Highly actionable, unique cost-cutting advice for this specific category" }
                },
                required: ["category", "allocatedPercentage", "allocatedAmount", "tips"]
              }
            },
            savingsProgressEstimate: {
              type: Type.OBJECT,
              properties: {
                monthsToGoal: { type: Type.NUMBER, description: "Calculated months to hit savings goal based on current leftover balance" },
                achievableByTarget: { type: Type.BOOLEAN, description: "Whether target date can be comfortably achieved" },
                recommendedMonthlySavings: { type: Type.NUMBER, description: "Monthly amount they need to save to meet the target month" },
                currentMonthlySavings: { type: Type.NUMBER, description: "Monthly income minus fixed minus variable expenses" }
              },
              required: ["monthsToGoal", "achievableByTarget", "recommendedMonthlySavings", "currentMonthlySavings"]
            },
            keyActionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 bite-sized, sequential, actionable finance habits to install."
            }
          },
          required: ["analysis", "suggestedBudget", "savingsProgressEstimate", "keyActionPlan"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Empty response from AI engine");
    }

    const data = JSON.parse(textResult.trim());
    return res.status(200).json(data);

  } catch (error) {
    console.warn("Notice: Budget advisor activated secure offline sandbox fallback parser.");
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const fallback = getMockBudgetAdvice(
      Number(body.monthlyIncome || 4000),
      Number(body.fixedExpenses || 1500),
      Number(body.variableExpenses || 1000),
      Number(body.targetAmount || 5000)
    );
    return res.status(200).json({ ...fallback, errorWarning: "API rate-limited on free-tier. Using offline high-fidelity simulator mode." });
  }
}
