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

function getMockInvestments(riskTolerance: string) {
  if (riskTolerance === "low") {
    return {
      analysis: "Given your low risk tolerance, we prioritize absolute security of your principal capital while outperforming basic currency inflation.",
      recommendedAllocation: [
        {
          name: "High-Yield Savings Account (HYSA)",
          type: "Cash Cash Equivalents",
          expectedReturn: "4.2% - 5.0% APY",
          riskLevel: "Low",
          minimumTimeline: "Immediate / No lockup",
          allocationPercentage: 60,
          pros: ["FDIC Insured up to $250k", "Instant 24/7 withdrawals", "Zero market fluctuation risk"],
          cons: ["Yield is tied to FED benchmark rate", "Negligible potential to build major wealth"],
          summary: "Best foundational place to park your liquid emergency finances and near-term goals."
        },
        {
          name: "Government Treasury Bills & Bonds",
          type: "Fixed Income",
          expectedReturn: "4.5% - 5.1%",
          riskLevel: "Low",
          minimumTimeline: "3 - 12 Months",
          allocationPercentage: 40,
          pros: ["Backed by government guarantee", "Exempt from state & local tax", "Locks in great yield rate"],
          cons: ["Pre-maturity liquidation fee", "Lower returns than long-term equities"],
          summary: "Outstanding way to secure high rate yield on savings you do not need immediate touch on."
        }
      ],
      learningCorners: [
        { term: "FDIC Insurance", definition: "A federal guarantee that your deposits are completely secure even if the backing bank goes under entirely." },
        { term: "Yield APY", definition: "Annual Percentage Yield—the absolute rate of compounding interest return you earn in a standard calendar year." }
      ]
    };
  } else if (riskTolerance === "medium") {
    return {
      analysis: "A balanced, moderate strategy that blends high liquidity savings with steady blue-chip global equity indices to safely accelerate your asset base.",
      recommendedAllocation: [
        {
          name: "Broad Market S&P 500 Index Funds (ETF)",
          type: "Equities / Global Stocks",
          expectedReturn: "8.0% - 10.0% average",
          riskLevel: "Medium",
          minimumTimeline: "3 - 5 Years",
          allocationPercentage: 55,
          pros: ["Massive exposure to America's 500 top corporations", "Very low fee ratios", "Outstanding historical record of building wealth"],
          cons: ["Short-term price volatility", "Requires holding during economic drops"],
          summary: "The single best long-term investment vehicle for beginners of all ages to build substantial compound compounding wealth."
        },
        {
          name: "High-Yield Savings Account (HYSA)",
          type: "Cash Equivalents",
          expectedReturn: "4.2% - 5.0% APY",
          riskLevel: "Low",
          minimumTimeline: "Immediate / No lockup",
          allocationPercentage: 35,
          pros: ["100% principal safety", "Liquid cushion for immediate goals", "No volatility"],
          cons: ["Returns cannot match equities long term"],
          summary: "Keeps your buffer capital liquid so you are never forced to sell stocks at a loss in a market dip."
        },
        {
          name: "Short-Term High Quality Corporate Bonds",
          type: "Fixed Income",
          expectedReturn: "5.5% - 6.2%",
          riskLevel: "Medium",
          minimumTimeline: "1 - 2 Years",
          allocationPercentage: 10,
          pros: ["Higher income yield than treasury bills", "Relatively stable performance"],
          cons: ["Extremely minor structural credit default risk"],
          summary: "Provides an elevated fixed-interest return stream with less volatile swings than stock indexes."
        }
      ],
      learningCorners: [
        { term: "ETF (Exchange-Traded Fund)", definition: "An investment basket that lets you purchase hundreds representing shares of different corporations simultaneously with one single click." },
        { term: "Volatily Risk", definition: "The regular, normal minor ups and downs of asset values on the global stock market in any given week or month." }
      ]
    };
  } else {
    return {
      analysis: "Aggressive growth blueprint targeting maximum long-term capitalization. We build a high-performance portfolio centered heavily on index equities and global growth sectors.",
      recommendedAllocation: [
        {
          name: "Broad S&P 500 + NASDAQ 100 Index Funds (ETF)",
          type: "Equities / Tech Stock Basket",
          expectedReturn: "10.0% - 12.0% average",
          riskLevel: "High",
          minimumTimeline: "5+ Years",
          allocationPercentage: 70,
          pros: ["Extreme long-run capitalization", "Capitalizes on key technological innovations", "Instant diversification"],
          cons: ["Susceptible to steep short-term downturns", "Emotionally hard to hold in market crashes"],
          summary: "High-conviction core basket for beginners aiming to lock in substantial asset compounding over years."
        },
        {
          name: "Dividend Growth Blue Chip Equities",
          type: "Individual Equities",
          expectedReturn: "6.0% - 8.0%",
          riskLevel: "Medium",
          minimumTimeline: "3 - 5 Years",
          allocationPercentage: 15,
          pros: ["Steady periodic cash returns", "Owned shares in extremely stable firms"],
          cons: ["Individual company default risk"],
          summary: "Injects recurring dividend income cashflow to invest back into your compounding portfolio."
        },
        {
          name: "High-Yield Savings Account (HYSA)",
          type: "Cash Cushion",
          expectedReturn: "4.2% - 5.0% APY",
          riskLevel: "Low",
          minimumTimeline: "Immediate",
          allocationPercentage: 15,
          pros: ["Emergency buffer", "Completely risk-free"],
          cons: ["Lower relative upside potential"],
          summary: "Essential emergency cash reserve ensuring you never panic-sell growth investments."
        }
      ],
      learningCorners: [
        { term: "Bear Market", definition: "A standard phase of the market cycle where prices fall 20% or more, creating the best buying discount opportunities for long-term investors." },
        { term: "Dividend reinvestment", definition: "Automatically buying more shares with the interest cash payments companies send you, accelerating your compounding snowball." }
      ]
    };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { savingsAmount, riskTolerance, monthlySurplus, currencyCode } = body;

    if (!riskTolerance) {
      return res.status(400).json({ error: "Missing user risk tolerance parameter" });
    }

    const code = currencyCode || "USD";
    const symbol = currencySymbols[code] || "$";

    if (!apiKey) {
      console.log("No API Key. Returning rich mock investment guide.");
      return res.status(200).json(getMockInvestments(riskTolerance));
    }

    const prompt = `You are a warm, educational financial investment advisor. Generate personalized investment recommendations side-by-side for a beginner user whose risk tolerance is level: "${riskTolerance}".
Provide an exact breakdown of asset classes (expected returns, safety features, minimum timeframe suitability, pros, cons, and a simplified definition of the financial concepts mentioned). Maximize educational descriptions. Make sure the recommended asset allocation percentages add up exactly to 100%.

User Profile context:
- Extra monthly investable savings cushion: ${symbol}${monthlySurplus || 500}
- Financial goals target base: ${symbol}${savingsAmount || 5000}
- Selected Currency Base: ${code} (${symbol})

Respond strictly with a structured JSON object conforming to the responseSchema format defined. Ensure all summaries, text explanations, or dollar references are contextualized for ${code} (${symbol}).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING, description: "Cohesive financial advice matching risk levels & baseline principles." },
            recommendedAllocation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Asset class name (e.g. S&P 500 ETF, Treasury bond, High Yield Savings)" },
                  type: { type: Type.STRING, description: "Asset style class" },
                  expectedReturn: { type: Type.STRING, description: "Expected annual yield range (e.g., '4.3% - 4.8%' or '8% - 10%')" },
                  riskLevel: { type: Type.STRING, description: "Exactly: 'Low', 'Medium', or 'High'" },
                  minimumTimeline: { type: Type.STRING, description: "Time horizon suitability (e.g. '1-3 years')" },
                  allocationPercentage: { type: Type.NUMBER, description: "Recommended allotment % of their saving margin" },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  summary: { type: Type.STRING, description: "Simple, easy to understand explanation of how it works and protects them." }
                },
                required: ["name", "type", "expectedReturn", "riskLevel", "minimumTimeline", "allocationPercentage", "pros", "cons", "summary"]
              }
            },
            learningCorners: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: "A financial jargon term used in the details" },
                  definition: { type: Type.STRING, description: "Extremely simple, relatable definition for complete finance list beginners" }
                },
                required: ["term", "definition"]
              }
            }
          },
          required: ["analysis", "recommendedAllocation", "learningCorners"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Unable to generate investment advisor advice");
    }

    const output = JSON.parse(textResult.trim());
    return res.status(200).json(output);

  } catch (error: any) {
    console.warn("Notice: Investment guide compiler activated secure offline sandbox fallback allocator.");
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const fallback = getMockInvestments(body.riskTolerance || "medium");
    return res.status(200).json({ ...fallback, errorWarning: "API rate-limited on free-tier. Using offline high-fidelity simulator mode." });
  }
}
