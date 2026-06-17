import React, { useState } from "react";
import { BudgetAdvice, FinancialCondition, Transaction } from "../types";
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { CheckCircle2, TrendingUp, AlertCircle, ArrowUpRight, Award, Plus, Sparkles, Eye, EyeOff, FileText, Check, ArrowRight, Percent, Sliders } from "lucide-react";
import { getCurrencyInfo, formatMoney } from "../utils/currency";

interface DashboardProps {
  condition: FinancialCondition;
  advice: BudgetAdvice;
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Housing": "#2563EB", // Blue
  "Utilities & Bills": "#06B6D4", // Cyan
  "Food & Groceries": "#10B981", // Emerald
  "Entertainment & Dining": "#F59E0B", // Amber
  "Transportation": "#EF4444", // Red
  "Shopping": "#EC4899", // Pink
  "Investments": "#8B5CF6", // Purple
  "Savings": "#14B8A6", // Teal
  "Other": "#64748B", // Slate
};

export default function Dashboard({ condition, advice, transactions, onAddTransaction }: DashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState<any>("Food & Groceries");
  const [newType, setNewType] = useState<"income" | "expense">("expense");

  const currentLeftover = condition.monthlyIncome - condition.fixedExpenses - condition.variableExpenses;
  const currencyCode = condition.currencyCode || "USD";
  const currencySymbol = getCurrencyInfo(currencyCode).symbol;

  // Identify statement transactions (prefixed or flagged as part of upload)
  const statementTransactions = transactions.filter(
    (tx) => tx.id.startsWith("stmt-") || tx.id.startsWith("local-")
  );
  const hasStatement = statementTransactions.length > 0;

  // Pie chart selection mode
  const [pieMode, setPieMode] = useState<"suggested" | "actual">("suggested");

  // Filter entire dashboard view to statement only
  const [filterToStatement, setFilterToStatement] = useState(false);

  // Totals for statement
  const statementExpenseTotal = statementTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const statementIncomeTotal = statementTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const statementCategoryTotals: Record<string, number> = {};
  statementTransactions.forEach((tx) => {
    if (tx.type === "expense") {
      statementCategoryTotals[tx.category] = (statementCategoryTotals[tx.category] || 0) + tx.amount;
    }
  });

  // Top category on statement
  let topCategory = "N/A";
  let topCategoryAmount = 0;
  Object.entries(statementCategoryTotals).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategory = cat;
    }
  });

  // Pie chart data from suggested budget VS statement
  const suggestedChartData = advice.suggestedBudget.map((item) => ({
    name: item.category,
    value: item.allocatedAmount,
    percentage: item.allocatedPercentage,
  }));

  const observedChartData = Object.entries(statementCategoryTotals).map(([name, value]) => ({
    name,
    value,
    percentage: statementExpenseTotal > 0 ? parseFloat(((value / statementExpenseTotal) * 100).toFixed(1)) : 0
  }));

  const activeChartData = pieMode === "suggested" ? suggestedChartData : observedChartData;

  // Displayed transactions taking filter into account
  const displayedTransactions = filterToStatement ? statementTransactions : transactions;

  // Line/Area Chart projection data: Project over 12 months (use appropriate surplus depending on filter)
  const activeLeftover = filterToStatement 
    ? Math.max(0, statementIncomeTotal - statementExpenseTotal) 
    : currentLeftover;

  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1;
    const currentGrowth = condition.currentSavings + (activeLeftover > 0 ? activeLeftover : 0) * monthIndex;
    const advisedGrowth = condition.currentSavings + advice.savingsProgressEstimate.recommendedMonthlySavings * monthIndex;
    return {
      month: `M${monthIndex}`,
      "Advised Savings Growth": Math.round(advisedGrowth),
      "Current Savings Growth": Math.round(currentGrowth),
      TargetGoal: condition.savingsGoal.targetAmount,
    };
  });

  return (
    <div id="dashboard-tab-content" className="space-y-6 animate-fadeIn font-sans">
      {advice.errorWarning && (
        <div id="sandbox-fallback-warning" className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider block text-amber-900">Calculated Sandbox Simulator Status</span>
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              Gemini free-tier request quota limit temporarily reached. We have automatically activated our high-fidelity secure local financial sandbox model to supply realistic compound allocations, action points, and budget optimization curves seamlessly.
            </p>
          </div>
        </div>
      )}

      {/* Filter Disclaimer Area if active */}
      {filterToStatement && (
        <div className="bg-indigo-600 text-white rounded-xl p-3.5 flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Eye className="w-4 h-4 text-sky-200" />
            <span>Active workspace filter: Dashboard stats and tables are isolated to the raw statement PDF upload.</span>
          </div>
          <button
            onClick={() => {
              setFilterToStatement(false);
              setPieMode("suggested");
            }}
            className="text-[10px] bg-white/20 hover:bg-white/30 text-white font-bold py-1 px-2.5 rounded-md transition-all text-xs cursor-pointer"
          >
            Reset view
          </button>
        </div>
      )}

      {/* Upper Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Advised Savings</span>
            <span className="text-xl font-bold text-slate-900">{formatMoney(advice.savingsProgressEstimate.recommendedMonthlySavings, currencyCode)}/mo</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Recommended target to hit goal</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Current Savings Rate</span>
            <span className="text-xl font-bold text-slate-900">
              {filterToStatement 
                ? formatMoney(Math.max(0, statementIncomeTotal - statementExpenseTotal), currencyCode) 
                : formatMoney(advice.savingsProgressEstimate.currentMonthlySavings, currencyCode)}/mo
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {filterToStatement ? "Net cash flow in statement" : "Current leftover after expenses"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Time to Goal</span>
            <span className="text-xl font-bold text-slate-900">{advice.savingsProgressEstimate.monthsToGoal} Mos</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">At current monthly savings speed</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Target Goal</span>
            <span className="text-xl font-bold text-slate-900">{formatMoney(condition.savingsGoal.targetAmount, currencyCode)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">By: {condition.savingsGoal.targetDate}</span>
          </div>
        </div>
      </div>

      {/* Target status alert */}
      <div className={`p-4 rounded-xl flex items-center gap-3 border ${
        advice.savingsProgressEstimate.achievableByTarget 
          ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
          : "bg-amber-50/50 border-amber-100 text-amber-800"
      }`}>
        {advice.savingsProgressEstimate.achievableByTarget ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        )}
        <p className="text-xs font-medium">
          {advice.savingsProgressEstimate.achievableByTarget 
            ? `Your goal of ${formatMoney(condition.savingsGoal.targetAmount, currencyCode)} is achievable by ${condition.savingsGoal.targetDate}! Keep sticking to your recommended investments & savings pattern!`
            : `Your goal might require adding ${formatMoney(Math.max(0, advice.savingsProgressEstimate.recommendedMonthlySavings - (filterToStatement ? Math.max(0, statementIncomeTotal - statementExpenseTotal) : advice.savingsProgressEstimate.currentMonthlySavings)), currencyCode)} more to your monthly saving rate to complete by your desired timeframe.`}
        </p>
      </div>

      {/* 🚀 STATEMENT COMPARATIVE AUDIT INTELLIGENCE CARD */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-rose-100 bg-gradient-to-r from-indigo-50/30 to-blue-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasStatement ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Statement Intelligence & Dynamic Audit</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {hasStatement 
                  ? `${statementTransactions.length} items parsed - comparing statement with recommended limits`
                  : "Upload bank files under 'Monthly Statement Drop' to populate audits"}
              </p>
            </div>
          </div>

          {hasStatement && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const val = !filterToStatement;
                  setFilterToStatement(val);
                  if (val) {
                    setPieMode("actual");
                  } else {
                    setPieMode("suggested");
                  }
                }}
                className={`py-1.5 px-3 rounded-lg font-bold text-xs border transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none ${
                  filterToStatement 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200"
                }`}
              >
                {filterToStatement ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" /> Stop Isolating View
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" /> Isolate Statement Only
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {!hasStatement ? (
          <div className="p-8 text-center text-slate-500 max-w-lg mx-auto">
            <p className="text-xs font-semibold leading-relaxed text-slate-600 mb-2">💡 Compare actual credit card and bank statements side-by-side</p>
            <p className="text-[11px] text-slate-400 mb-4">
              Drop any bank ledger exports, PDF credit statements, or CSV layouts in the <strong className="text-slate-500">Monthly Statement Drop</strong> tab. Gemini will scan layout metrics to load itemized balances, which auto-activates direct dashboard audit benchmarks right here.
            </p>
            <div className="inline-flex items-center text-[10px] bg-indigo-50 font-bold text-indigo-600 px-2.5 py-1 rounded">
              Awaiting Document Feed
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Horizontal KPI breakdown for statement */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Statement Outflow total</span>
                <span className="text-base font-extrabold text-slate-800 font-mono mt-1 block">{formatMoney(statementExpenseTotal, currencyCode)}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Accumulated debit withdrawals</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Statement Inflow Total</span>
                <span className="text-base font-extrabold text-emerald-600 font-mono mt-1 block">+{formatMoney(statementIncomeTotal, currencyCode)}</span>
                <span className="text-[10px] text-emerald-500 font-medium mt-1 block font-semibold leading-none">Uncovered direct deposits</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Top Spending Category</span>
                <span className="text-base font-extrabold text-indigo-700 mt-1 block truncate" title={topCategory}>{topCategory}</span>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">{formatMoney(topCategoryAmount, currencyCode)} spent</span>
              </div>
            </div>

            {/* Side-by-Side Category Spending Audit benchmarking */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Category-Wise Performance Allocation Benchmarks</span>
              <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100">
                <div className="grid grid-cols-12 p-2.5 bg-slate-50 font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  <div className="col-span-5">Category Name</div>
                  <div className="col-span-3 text-right">Statement Actual Spent</div>
                  <div className="col-span-4 text-right">Recommended Limit</div>
                </div>

                {advice.suggestedBudget.map((item, index) => {
                  const spent = statementCategoryTotals[item.category] || 0;
                  const allocated = item.allocatedAmount;
                  const ratio = spent / (allocated || 1);
                  const isOver = spent > allocated;
                  
                  return (
                    <div key={index} className="grid grid-cols-12 p-3 text-xs items-center hover:bg-slate-50/50 transition-colors zoom-in">
                      <div className="col-span-5 flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.category] || "#64748B" }} />
                        <span className="font-bold text-slate-800">{item.category}</span>
                      </div>
                      <div className="col-span-3 text-right font-mono font-bold text-slate-700">
                        {formatMoney(spent, currencyCode)}
                      </div>
                      <div className="col-span-4 text-right flex flex-col items-end">
                        <span className="font-mono text-slate-500">{formatMoney(allocated, currencyCode)}</span>
                        
                        {spent > 0 ? (
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 select-none ${
                            isOver 
                              ? "bg-rose-50 text-rose-600 border border-rose-100" 
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                            {isOver 
                              ? `Over by +${formatMoney(spent - allocated, currencyCode)}` 
                              : `Within plan (${Math.round(ratio * 100)}% used)`
                            }
                          </span>
                        ) : (
                          <span className="inline-block text-[9px] text-slate-300 font-semibold mt-1">No spending detected</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dual Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suggested Budget Breakdown Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Allocation Blueprint Visualization</h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                {pieMode === "suggested" ? "AI Suggested Budget Blueprint" : "Observed Statement Expenses Profile"}
              </p>
            </div>
            
            {hasStatement && (
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setPieMode("suggested")}
                  className={`py-1 px-2.5 text-[9px] font-extrabold uppercase tracking-wide rounded-md transition-all cursor-pointer focus:outline-none ${
                    pieMode === "suggested"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  AI Suggested
                </button>
                <button
                  type="button"
                  onClick={() => setPieMode("actual")}
                  className={`py-1 px-2.5 text-[9px] font-extrabold uppercase tracking-wide rounded-md transition-all cursor-pointer focus:outline-none ${
                    pieMode === "actual"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Observed Upload
                </button>
              </div>
            )}
          </div>

          <div className="h-64 flex items-center justify-center">
            {activeChartData.length === 0 ? (
              <div className="text-center text-xs text-slate-400">
                No active debit transactions to render in comparative mode.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {activeChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS["Other"]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(Number(value), currencyCode)} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 12 Month Future Balance Cumulative Growth Projection Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">12-Month Accumulative Savings Curve</h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 mb-4 font-mono">
            {filterToStatement ? "Projecting balance using statement-specific net margins" : "Comparing Current pace vs. AI-Recommended pace"}
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAdvised" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${currencySymbol}${v}`} tickLine={false} />
                <Tooltip formatter={(value) => formatMoney(Number(value), currencyCode)} />
                <Legend />
                <Area type="monotone" dataKey="Advised Savings Growth" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorAdvised)" />
                <Area type="monotone" dataKey="Current Savings Growth" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorCurrent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gemini Analysis Output */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 relative overflow-hidden shadow-xs">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-base font-bold tracking-tight text-white">AI Financial Diagnostic Report</h3>
        </div>
        <p className="text-slate-300 leading-relaxed text-xs mb-6 max-w-4xl">{advice.analysis}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
          <div>
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-3">Key Strategic Action Plan</h4>
            <ul className="space-y-2.5">
              {advice.keyActionPlan.map((action, i) => (
                <li key={i} className="flex items-start text-xs text-slate-300 font-medium">
                  <span className="font-bold text-blue-400 mr-2">{i+1}.</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Category Advice</h4>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
              {advice.suggestedBudget.slice(0, 3).map((item, i) => (
                <div key={i} className="text-xs p-3 bg-white/5 border border-white/[0.03] rounded-lg hover:bg-white/10 transition-colors">
                  <span className="font-semibold text-white">{item.category} Budget tips:</span>
                  <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">{item.tips}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Transactions Tracker Tab */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Integrated Transaction Registry</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Real-time banking feeds and manual records collected side-by-side</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="cursor-pointer bg-blue-600 block px-4 py-2 border border-blue-500 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none"
            >
              <Plus className="w-3.5 h-3.5" /> Add Transaction
            </button>
          )}
        </div>

        {showAddForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newDescription && newAmount) {
                onAddTransaction({
                  id: "m" + Date.now(),
                  date: new Date().toISOString().split("T")[0],
                  description: newDescription,
                  amount: parseFloat(newAmount) || 0,
                  type: newType,
                  category: newCategory,
                });
                setNewDescription("");
                setNewAmount("");
                setShowAddForm(false);
              }
            }}
            className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-fadeIn"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Log Manual Transaction</span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  required
                  placeholder="Walmart, Utility Bill, Petrol"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Amount</label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold text-xs">{currencySymbol}</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                >
                  <option value="Housing">Housing</option>
                  <option value="Utilities & Bills">Utilities & Bills</option>
                  <option value="Food & Groceries">Food & Groceries</option>
                  <option value="Entertainment & Dining">Entertainment & Dining</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Investments">Investments</option>
                  <option value="Savings">Savings</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
                <div className="flex rounded-lg border border-slate-200 p-0.5 bg-white">
                  <button
                    type="button"
                    onClick={() => setNewType("expense")}
                    className={`flex-1 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                      newType === "expense"
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("income")}
                    className={`flex-1 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                      newType === "income"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-200/50">
              <button
                type="submit"
                className="cursor-pointer bg-blue-600 border border-blue-500 px-4 py-2 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                <Plus className="w-3.5 h-3.5" /> Save Transaction
              </button>
            </div>
          </form>
        )}

        {displayedTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-sm font-medium">No transactions recorded here yet.</p>
            <p className="text-xs mt-1">Add transactions manually or upload bank statements in the 'Monthly Statement Drop' tab to view records!</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold">Merchant & Description</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayedTransactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">{tx.date}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{tx.description}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ 
                        backgroundColor: (CATEGORY_COLORS[tx.category] || "#64748B") + "15",
                        color: CATEGORY_COLORS[tx.category] || "#64748B"
                      }}>
                        {tx.category}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${tx.type === "income" ? "text-emerald-600" : "text-slate-900"}`}>
                      {tx.type === "income" ? "+" : "-"}{currencySymbol}{tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayedTransactions.length > 10 && (
              <p className="text-center text-xs text-slate-400 mt-4">Showing most recent 10 transactions</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
