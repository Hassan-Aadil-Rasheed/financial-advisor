import { Transaction } from "../types";

export const MOCK_BANKS = [
  { id: "chase", name: "Chase Bank", color: "bg-blue-600 hover:bg-blue-700", textColor: "text-white" },
  { id: "bofa", name: "Bank of America", color: "bg-red-600 hover:bg-red-700", textColor: "text-white" },
  { id: "wells", name: "Wells Fargo", color: "bg-amber-600 hover:bg-amber-700", textColor: "text-white" },
  { id: "capone", name: "Capital One", color: "bg-sky-900 hover:bg-sky-950", textColor: "text-white" },
  { id: "fidelity", name: "Fidelity Investments", color: "bg-emerald-700 hover:bg-emerald-800", textColor: "text-white" },
];

export const MOCK_BANK_TRANSACTIONS: Record<string, Transaction[]> = {
  chase: [
    { id: "c1", date: "2026-05-28", description: "Safeway Groceries", amount: 124.50, type: "expense", category: "Food & Groceries" },
    { id: "c2", date: "2026-05-27", description: "Netflix Subscription", amount: 15.49, type: "expense", category: "Utilities & Bills" },
    { id: "c3", date: "2026-05-25", description: "Landlord Rent Payment", amount: 1200.00, type: "expense", category: "Housing" },
    { id: "c4", date: "2026-05-25", description: "Chevron Gas Station", amount: 45.00, type: "expense", category: "Transportation" },
    { id: "c5", date: "2026-05-22", description: "Workplace Direct Deposit Payroll", amount: 3200.00, type: "income", category: "Savings" },
    { id: "c6", date: "2026-05-20", description: "Starbucks Coffee", amount: 6.75, type: "expense", category: "Entertainment & Dining" },
    { id: "c7", date: "2026-05-18", description: "Trader Joe's", amount: 82.30, type: "expense", category: "Food & Groceries" },
    { id: "c8", date: "2026-05-15", description: "Electric Utility Bill", amount: 95.20, type: "expense", category: "Utilities & Bills" },
  ],
  bofa: [
    { id: "b1", date: "2026-05-29", description: "Target Superstore", amount: 64.20, type: "expense", category: "Shopping" },
    { id: "b2", date: "2026-05-28", description: "Gym Membership", amount: 40.00, type: "expense", category: "Utilities & Bills" },
    { id: "b3", date: "2026-05-25", description: "Payroll Deposit Co.", amount: 2800.00, type: "income", category: "Savings" },
    { id: "b4", date: "2026-05-24", description: "Local Diner Lunch", amount: 32.50, type: "expense", category: "Entertainment & Dining" },
    { id: "b5", date: "2026-05-20", description: "Subway Commute Card", amount: 50.00, type: "expense", category: "Transportation" },
    { id: "b6", date: "2026-05-15", description: "Whole Foods Market", amount: 145.10, type: "expense", category: "Food & Groceries" },
  ],
  wells: [
    { id: "w1", date: "2026-05-29", description: "Warm Rent Apartment", amount: 1050.00, type: "expense", category: "Housing" },
    { id: "w2", date: "2026-05-28", description: "Uber Ride", amount: 24.50, type: "expense", category: "Transportation" },
    { id: "w3", date: "2026-05-26", description: "Weekly Costco Grocery Run", amount: 210.00, type: "expense", category: "Food & Groceries" },
    { id: "w4", date: "2026-05-24", description: "City Water & Sewer Bill", amount: 72.80, type: "expense", category: "Utilities & Bills" },
    { id: "w5", date: "2026-05-22", description: "Salary Deposit Transfer", amount: 3500.00, type: "income", category: "Savings" },
    { id: "w6", date: "2026-05-19", description: "Cinema & Popcorn Night", amount: 35.00, type: "expense", category: "Entertainment & Dining" },
  ],
  capone: [
    { id: "cp1", date: "2026-05-29", description: "Best Buy Tech Upgrade", amount: 299.99, type: "expense", category: "Shopping" },
    { id: "cp2", date: "2026-05-27", description: "Amazon.com Shopping", amount: 48.50, type: "expense", category: "Shopping" },
    { id: "cp3", date: "2026-05-25", description: "Spotify Music", amount: 10.99, type: "expense", category: "Utilities & Bills" },
    { id: "cp4", date: "2026-05-21", description: "Remote Work Stripe Deposit", amount: 4100.00, type: "income", category: "Savings" },
    { id: "cp5", date: "2026-05-18", description: "Ramen Dinner & Drinks", amount: 68.00, type: "expense", category: "Entertainment & Dining" },
  ],
  fidelity: [
    { id: "f1", date: "2026-05-28", description: "Fidelity S&P 500 Index Purchase", amount: 500.00, type: "expense", category: "Investments" },
    { id: "f2", date: "2026-05-25", description: "Dividend Payment Recv", amount: 45.00, type: "income", category: "Investments" },
    { id: "f3", date: "2026-05-15", description: "Fidelity S&P 500 Index Purchase", amount: 500.00, type: "expense", category: "Investments" },
  ],
};

export const SAMPLE_STATEMENT_CSV = `Date,Description,Amount,Type
2026-05-28,Wall Street Journal Subs,29.00,Expense
2026-05-25,Kroger Grocery Store,112.45,Expense
2026-05-24,Gas & Power Corp Bill,85.00,Expense
2026-05-22,Main Street Apartments Rent,1350.00,Expense
2026-05-20,Local Gas Station Fuel,40.00,Expense
2026-05-18,Stripe Payout Consulting,1500.00,Income
2026-05-15,Steam Video Game Store,59.99,Expense
2026-05-14,Sushi House Dinner,72.50,Expense`;

export const MOCK_EDUCATIONAL_TERMS = [
  {
    term: "The 50/30/20 Rule",
    definition: "A simple budgeting system: Allocate 50% of your take-home pay to Needs (housing, groceries, bills), 30% to Wants (entertainment, shopping, travel), and 20% to Savings, investments, and debt paydown.",
  },
  {
    term: "Emergency Fund",
    definition: "An essential financial safety net consisting of 3 to 6 months' worth of essential living expenses kept in a high-yield savings (HYSA) or liquid account, protects you from unexpected costs like high medical bills or job losses.",
  },
  {
    term: "Compound Interest",
    definition: "The 'eighth wonder of the world' where you earn interest on both your original principal and also on the interest that accumulates over time, allowing your wealth to snowball exponentially over long periods.",
  },
  {
    term: "High-Yield Savings Account (HYSA)",
    definition: "A savings account that yields 10x-20x more interest than standard brick-and-mortar savings accounts (typically 4-5% APY compared to 0.01%), providing safe, FDIC-insured returns with no risk.",
  },
  {
    term: "Index Funds & ETFs",
    definition: "Broad market investment vehicles that bundle hundreds of stocks into a single fund (for example tracking the S&P 500). They offer massive diversification, low fees, and historically return 8-10% annually on average over time.",
  },
  {
    term: "Dollar-Cost Averaging (DCA)",
    definition: "An investment strategy where you invest a fixed amount of money at regular intervals (e.g. $100 every month) regardless of whether stock prices are high or low, smoothing out market price fluctuations over the long term.",
  },
];
