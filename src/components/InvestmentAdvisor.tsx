import React, { useState, useEffect } from "react";
import { FinancialCondition, InvestmentAdviceResponse, InvestmentOption } from "../types";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { TrendingUp, ShieldAlert, BookOpen, RefreshCw, Star, Sparkles } from "lucide-react";

interface InvestmentAdvisorProps {
  condition: FinancialCondition;
}

const BAR_COLORS = ["#2563EB", "#0D9488", "#10B981", "#EAB308", "#D946EF", "#6366F1"];

export default function InvestmentAdvisor({ condition }: InvestmentAdvisorProps) {
  const [risk, setRisk] = useState<"low" | "medium" | "high">(condition.riskTolerance);
  const [advice, setAdvice] = useState<InvestmentAdviceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInvestmentAdvice = async (riskLevel: "low" | "medium" | "high") => {
    setLoading(true);
    try {
      const surplus = condition.monthlyIncome - condition.fixedExpenses - condition.variableExpenses;
      const response = await fetch("/api/get-investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          savingsAmount: condition.savingsGoal.targetAmount,
          riskTolerance: riskLevel,
          monthlySurplus: surplus > 0 ? surplus : 500,
          currencyCode: condition.currencyCode || "USD",
        }),
      });
      const data = await response.json();
      setAdvice(data);
    } catch (err) {
      console.error("Error receiving investment recommendations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestmentAdvice(risk);
  }, [risk, condition]);

  // Chart structured values
  const chartData = advice?.recommendedAllocation.map((item) => ({
    name: item.name.split("(")[0].trim(), // Shorten naming descriptions
    Percentage: item.allocationPercentage,
  })) || [];

  return (
    <div id="investment-advisor-workspace" className="space-y-6 animate-fadeIn font-sans">
      {advice && (advice as any).errorWarning && (
        <div id="investment-sandbox-warning" className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider block text-amber-900">Sandbox Allocation Simulator Active</span>
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              Based on your selected risk level, we've deployed high-fidelity local savings and investment simulation structures tailored to your goal since the live API request threshold is momentarily bridged.
            </p>
          </div>
        </div>
      )}

      {/* Risk Selector Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-950">Growth Allocator & Investment Suggestions</h3>
          <p className="text-xs text-slate-500 mt-0.5">Discover where to allocate excess cash to hit objectives safely.</p>
        </div>
        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200/80">
          {(["low", "medium", "high"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRisk(r)}
              className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer focus:outline-none ${
                risk === r
                  ? "bg-white text-blue-600 shadow-xs font-extrabold border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {r} RISK
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-9 h-9 text-blue-600 animate-spin" />
          <p className="text-slate-800 font-bold text-sm">Personalizing Allocation Models...</p>
          <p className="text-xs text-slate-400">Gemini crafting unique investment suggestions</p>
        </div>
      ) : advice ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Allocation Breakdown and Summary Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-blue-600 tracking-wider uppercase block mb-1">Recommended Portfolio Target</span>
                <h4 className="text-sm font-bold text-slate-950">Your Allocation Mix</h4>
                <p className="text-xs text-slate-500 mt-0.5 mb-5 font-medium">Designed based on your profile to offset downside risks.</p>
              </div>

              <div className="h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="Percentage"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-4 border-t border-slate-200 pt-3">
                {advice.recommendedAllocation.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 font-semibold truncate max-w-[200px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }} />
                      {item.name.substring(0, 24)}...
                    </span>
                    <span className="font-bold text-slate-900">{item.allocationPercentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Advisor Synopsis */}
            <div className="lg:col-span-8 bg-slate-950 text-white rounded-xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between border border-slate-800">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 font-mono">Expert Advisor Insights</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-white leading-tight">Strategic Investment Overview</h3>
                <p className="text-slate-300 text-xs leading-relaxed max-w-2xl font-medium">{advice.analysis}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 mt-6 border-t border-white/10">
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 text-blue-300 mb-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Income Accretion Goal</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">By prioritizing dollar cost averaging into these baskets, you secure steady compounding without excessive downside.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 text-rose-400 mb-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Volatility Buffer Protection</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">Always preserve 3 to 6 months of essential cash within your High-Yield Account before moving funds into index instruments.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Detailed Asset Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asset Analysis & Allocation Baskets</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advice.recommendedAllocation.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold text-blue-600 bg-blue-50/70 border border-blue-100">
                        {item.type}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">{item.allocationPercentage}% Portfolio</span>
                    </div>
                    <h5 className="font-bold text-sm text-slate-950">{item.name}</h5>
                    <p className="text-xs text-slate-500 leading-normal font-medium">{item.summary}</p>
                  </div>

                  <div className="space-y-2 border-t border-b border-slate-100 py-3 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Expected Return:</span>
                      <span className="font-bold text-emerald-600">{item.expectedReturn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Risk Profile:</span>
                      <span className={`font-bold ${item.riskLevel === "Low" ? "text-emerald-600" : item.riskLevel === "Medium" ? "text-blue-600" : "text-rose-600"}`}>{item.riskLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Holding timeline:</span>
                      <span className="font-bold text-slate-600">{item.minimumTimeline}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded tracking-wide uppercase inline-block mb-1.5">Pros</span>
                      <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-500 font-medium">
                        {item.pros.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded tracking-wide uppercase inline-block mb-1.5">Downside Cons</span>
                      <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-500 font-medium">
                        {item.cons.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Corner Definitions for Beginners */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Learning Corner: Term Demystifier</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {advice.learningCorners.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow-xs border border-slate-200/70">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    {item.term}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-medium">{item.definition}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="py-12 text-center text-slate-500">
          <p>Please finalize your onboarding coordinates to formulate allocation charts.</p>
        </div>
      )}
    </div>
  );
}
