export type CurrencyCode = "USD" | "INR" | "PKR" | "EUR" | "GBP" | "CAD" | "AUD" | "AED" | "SAR";

export interface FinancialCondition {
  monthlyIncome: number;
  fixedExpenses: number; // rent, bills, insurances
  variableExpenses: number; // dining, shopping, fun
  currentSavings: number;
  savingsGoal: {
    targetAmount: number;
    targetDate: string; // YYYY-MM
  };
  riskTolerance: "low" | "medium" | "high";
  currencyCode?: CurrencyCode;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // positive for expense, negative/positive treatment clean in UI
  type: "income" | "expense";
  category: BudgetCategory;
}

export type BudgetCategory =
  | "Housing"
  | "Utilities & Bills"
  | "Food & Groceries"
  | "Entertainment & Dining"
  | "Transportation"
  | "Shopping"
  | "Investments"
  | "Savings"
  | "Other";

export interface BudgetAdvice {
  analysis: string;
  suggestedBudget: {
    category: string;
    allocatedPercentage: number;
    allocatedAmount: number;
    tips: string;
  }[];
  savingsProgressEstimate: {
    monthsToGoal: number;
    achievableByTarget: boolean;
    recommendedMonthlySavings: number;
    currentMonthlySavings: number;
  };
  keyActionPlan: string[];
  errorWarning?: string;
}

export interface InvestmentOption {
  name: string;
  type: string;
  expectedReturn: string; // e.g., "7-9%"
  riskLevel: "Low" | "Medium" | "High";
  minimumTimeline: string; // e.g., "3-5 years"
  allocationPercentage: number; // Recomended % of their leftover capital
  pros: string[];
  cons: string[];
  summary: string;
}

export interface InvestmentAdviceResponse {
  analysis: string;
  recommendedAllocation: InvestmentOption[];
  learningCorners: {
    term: string;
    definition: string;
  }[];
  errorWarning?: string;
}
