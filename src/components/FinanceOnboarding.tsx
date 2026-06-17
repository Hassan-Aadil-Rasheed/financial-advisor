import React, { useState } from "react";
import { FinancialCondition, CurrencyCode } from "../types";
import { CURRENCIES, getCurrencyInfo, convertAmount, formatMoney } from "../utils/currency";
import { HelpCircle, DollarSign, Target, Calendar, Award, Sparkles, Globe } from "lucide-react";

interface OnboardingProps {
  onComplete: (data: FinancialCondition) => void;
  initialData?: FinancialCondition;
}

export default function FinanceOnboarding({ onComplete, initialData }: OnboardingProps) {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(initialData?.currencyCode || "USD");

  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialData?.monthlyIncome || 4500);
  const [fixedExpenses, setFixedExpenses] = useState<number>(initialData?.fixedExpenses || 1800);
  const [variableExpenses, setVariableExpenses] = useState<number>(initialData?.variableExpenses || 1200);
  const [currentSavings, setCurrentSavings] = useState<number>(initialData?.currentSavings || 2500);
  
  const [targetAmount, setTargetAmount] = useState<number>(initialData?.savingsGoal.targetAmount || 10000);
  const [targetDate, setTargetDate] = useState<string>(initialData?.savingsGoal.targetDate || "2027-06");
  const [riskTolerance, setRiskTolerance] = useState<"low" | "medium" | "high">(initialData?.riskTolerance || "medium");

  const handleCurrencyChange = (newCode: CurrencyCode) => {
    // Automatically simulate conversion of entered figures into new currency space using approximate live rates
    setMonthlyIncome(convertAmount(monthlyIncome, currencyCode, newCode));
    setFixedExpenses(convertAmount(fixedExpenses, currencyCode, newCode));
    setVariableExpenses(convertAmount(variableExpenses, currencyCode, newCode));
    setCurrentSavings(convertAmount(currentSavings, currencyCode, newCode));
    setTargetAmount(convertAmount(targetAmount, currencyCode, newCode));
    setCurrencyCode(newCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      monthlyIncome,
      fixedExpenses,
      variableExpenses,
      currentSavings,
      savingsGoal: {
        targetAmount,
        targetDate,
      },
      riskTolerance,
      currencyCode,
    });
  };

  const leftover = monthlyIncome - fixedExpenses - variableExpenses;
  const currentSymbol = getCurrencyInfo(currencyCode).symbol;

  return (
    <div id="finance-onboarding-container" className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl shadow-xs p-6 transition-all font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 mb-5 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950">Define Your Financial Canvas</h2>
            <p className="text-xs text-slate-500 mt-0.5">Provide basic inputs below. We will build your path with Gemini AI.</p>
          </div>
        </div>

        {/* Currency setting dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-full sm:w-auto">
          <Globe className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-400 leading-none">Currency Setup</span>
            <select
              id="currency-selector"
              className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none pr-6 cursor-pointer mt-0.5"
              value={currencyCode}
              onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
            >
              {Object.values(CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code} className="font-sans font-bold">
                  {curr.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Income and Existing Core Savings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Monthly Take-Home Income
            </label>
            <div className="relative rounded-lg shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 font-bold text-xs">{currentSymbol}</span>
              </div>
              <input
                type="number"
                id="monthly-income-input"
                className="block w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm transition-all font-bold"
                placeholder="4500"
                value={monthlyIncome || ""}
                onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
                required
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Total net pay received each month after taxes.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              Current Liquid Savings
            </label>
            <div className="relative rounded-lg shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 font-bold text-xs">{currentSymbol}</span>
              </div>
              <input
                type="number"
                id="current-savings-input"
                className="block w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm transition-all font-bold"
                placeholder="2500"
                value={currentSavings || ""}
                onChange={(e) => setCurrentSavings(Math.max(0, Number(e.target.value)))}
                required
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Your current bank balance or emergency deposits.</p>
          </div>
        </div>

        {/* Row 2: Monthly Expenses */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Monthly Expenditures</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                Fixed Expenses
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold text-xs">{currentSymbol}</span>
                </div>
                <input
                  type="number"
                  id="fixed-expenses-input"
                  className="block w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-bold"
                  placeholder="1800"
                  value={fixedExpenses || ""}
                  onChange={(e) => setFixedExpenses(Math.max(0, Number(e.target.value)))}
                  required
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">Rent, bills, loan payments, essential subscriptions.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                Variable Expenses
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold text-xs">{currentSymbol}</span>
                </div>
                <input
                  type="number"
                  id="variable-expenses-input"
                  className="block w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-bold"
                  placeholder="1200"
                  value={variableExpenses || ""}
                  onChange={(e) => setVariableExpenses(Math.max(0, Number(e.target.value)))}
                  required
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">Dining out, coffee, clothes, movies, fun trips.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Leftover Monthly Margin:</span>
            <span className={`font-bold text-sm ${leftover >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {leftover >= 0 ? `+${formatMoney(leftover, currencyCode)}` : `-${formatMoney(Math.abs(leftover), currencyCode)}`} / month
            </span>
          </div>
        </div>

        {/* Row 3: Your Target Savings Goal */}
        <div className="bg-blue-50/25 rounded-xl p-5 border border-blue-100 space-y-4">
          <h3 className="text-[10px] font-bold text-blue-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            Define Your Target Financial Goal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-blue-900/75 mb-2">
                What is your savings goal?
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-blue-400 font-bold text-xs">{currentSymbol}</span>
                </div>
                <input
                  type="number"
                  id="target-amount-input"
                  className="block w-full pl-8 pr-3 py-2.5 bg-white border border-blue-200 rounded-lg text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-bold"
                  placeholder="10000"
                  value={targetAmount || ""}
                  onChange={(e) => setTargetAmount(Math.max(0, Number(e.target.value)))}
                  required
                />
              </div>
              <p className="mt-1 text-[10px] text-blue-700/60">Amount needed for emergency buffers, house deposits, travel, etc.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-900/75 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Target timeframe (Month)
              </label>
              <input
                type="month"
                id="target-date-input"
                className="block w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-bold"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
              <p className="mt-1 text-[10px] text-blue-700/60">Your target completion milestone schedule.</p>
            </div>
          </div>
        </div>

        {/* Row 4: Risk Tolerance Card Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            Your Investment Risk Comfort Profile
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              id="risk-low-btn"
              onClick={() => setRiskTolerance("low")}
              className={`p-3.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 focus:outline-none ${
                riskTolerance === "low"
                  ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${riskTolerance === "low" ? "text-emerald-700" : "text-slate-500"}`}>Low</span>
              <span className="text-[9px] text-slate-400 leading-normal font-medium">Safety/Guarantee</span>
            </button>

            <button
              type="button"
              id="risk-medium-btn"
              onClick={() => setRiskTolerance("medium")}
              className={`p-3.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 focus:outline-none ${
                riskTolerance === "medium"
                  ? "border-blue-500 bg-blue-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${riskTolerance === "medium" ? "text-blue-700" : "text-slate-500"}`}>Medium</span>
              <span className="text-[9px] text-slate-400 leading-normal font-medium">Moderate Volatility</span>
            </button>

            <button
              type="button"
              id="risk-high-btn"
              onClick={() => setRiskTolerance("high")}
              className={`p-3.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 focus:outline-none ${
                riskTolerance === "high"
                  ? "border-rose-500 bg-rose-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${riskTolerance === "high" ? "text-rose-700" : "text-slate-500"}`}>High</span>
              <span className="text-[9px] text-slate-400 leading-normal font-medium">Aggressive Growth</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="onboarding-submit-btn"
          className="cursor-pointer w-full mt-2 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-xs hover:bg-blue-700 transition-all active:scale-[0.995] flex items-center justify-center gap-2 focus:outline-none border border-blue-500"
        >
          Generate My Personalized Budget Strategy
          <Sparkles className="w-4 h-4 text-blue-200" />
        </button>
      </form>
    </div>
  );
}
