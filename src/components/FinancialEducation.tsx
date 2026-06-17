import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { MOCK_EDUCATIONAL_TERMS } from "../utils/mockData";
import { BookOpen, HelpCircle, GraduationCap, DollarSign, Hourglass, Percent, Shield, ArrowRight } from "lucide-react";
import { CurrencyCode } from "../types";
import { getCurrencyInfo, formatMoney } from "../utils/currency";

interface FinancialEducationProps {
  currencyCode?: CurrencyCode;
}

export default function FinancialEducation({ currencyCode = "USD" }: FinancialEducationProps) {
  const currentSymbol = getCurrencyInfo(currencyCode).symbol;

  // Compounding interest visualizer states
  const [initDeposit, setInitDeposit] = useState(2000);
  const [monthlyContribution, setMonthlyContribution] = useState(300);
  const [annualRate, setAnnualRate] = useState(8);
  const [holdingYears, setHoldingYears] = useState(15);

  const calculateCompoundingData = () => {
    const data = [];
    const monthlyRate = annualRate / 100 / 12;
    let totalValue = initDeposit;
    let totalInvested = initDeposit;

    for (let yr = 0; yr <= holdingYears; yr++) {
      if (yr > 0) {
        // Compound month-by-month for 12 months inside the year
        for (let m = 0; m < 12; m++) {
          totalValue = (totalValue + monthlyContribution) * (1 + monthlyRate);
          totalInvested += monthlyContribution;
        }
      }
      data.push({
        year: `Year ${yr}`,
        "Total Wealth Accumulated": Math.round(totalValue),
        "Principal Capital Deposited": Math.round(totalInvested),
      });
    }
    return data;
  };

  const compoundingChartData = calculateCompoundingData();
  const finalCompiledAmt = compoundingChartData[compoundingChartData.length - 1]["Total Wealth Accumulated"];
  const finalInvestedAmt = compoundingChartData[compoundingChartData.length - 1]["Principal Capital Deposited"];
  const finalInterestEarned = finalCompiledAmt - finalInvestedAmt;

  return (
    <div id="financial-education-portal" className="space-y-6 animate-fadeIn font-sans">
      
      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Compounding Interest Playground (Visualizer) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 mb-1">
              <GraduationCap className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-sans">Compound Interest Playground</span>
            </div>
            <h3 className="text-base font-bold text-slate-950">The Avalanche Compounding Engine</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">See how small additions turn into significant nest eggs over time.</p>
          </div>

          <div className="space-y-4">
            {/* Input Slider 1: Initial Deposit */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  Initial Principal Savings:
                </span>
                <span className="text-slate-950 font-bold">{formatMoney(initDeposit, currencyCode)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={initDeposit}
                id="slider-init-deposit"
                onChange={(e) => setInitDeposit(Number(e.target.value))}
              />
            </div>

            {/* Input Slider 2: Monthly Additional */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Monthly Invested Addition:
                </span>
                <span className="text-slate-950 font-bold">{formatMoney(monthlyContribution, currencyCode)}/mo</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={monthlyContribution}
                id="slider-monthly-contribution"
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              />
              <p className="text-[10px] text-slate-400 font-mono font-medium">Tip: Reallocate this from your optimized budget leftover!</p>
            </div>

            {/* Input Slider 3: Yield Percentage rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <Percent className="w-3.5 h-3.5 text-amber-500" />
                  Expected Annual Interest Return:
                </span>
                <span className="text-slate-950 font-bold">{annualRate}% APY</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={annualRate}
                id="slider-annual-rate"
                onChange={(e) => setAnnualRate(Number(e.target.value))}
              />
              <p className="text-[10px] text-slate-400 leading-normal font-medium">Typical values: HYSA Account (~4-5%), S&P Index Equities (~8-10%), Growth Tech (~11-12%).</p>
            </div>

            {/* Input Slider 4: Time in years */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <Hourglass className="w-3.5 h-3.5 text-sky-500" />
                  Compound Time Horizon:
                </span>
                <span className="text-slate-950 font-bold">{holdingYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={holdingYears}
                id="slider-holding-years"
                onChange={(e) => setHoldingYears(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Area Chart visualization of compounding growth */}
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={compoundingChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} tickFormatter={(val) => `${currentSymbol}${val}`} />
                <Tooltip formatter={(value) => formatMoney(Number(value), currencyCode)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                <Area type="monotone" dataKey="Total Wealth Accumulated" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="Principal Capital Deposited" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compound Interest Outcomes Sidebar Panel */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Compound Projections</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Final Aggregate Value</span>
                <span className="text-3xl font-extrabold text-white tracking-tight">{formatMoney(finalCompiledAmt, currencyCode)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Your Deposits</span>
                  <span className="text-sm font-extrabold text-slate-200">{formatMoney(finalInvestedAmt, currencyCode)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-300 block uppercase tracking-wider font-bold">Free Interest Growth</span>
                  <span className="text-sm font-extrabold text-emerald-400">+{formatMoney(finalInterestEarned, currencyCode)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/5 text-xs text-slate-300 leading-relaxed space-y-2">
              <span className="font-bold text-blue-300">The Power of the Snowball Rule:</span>
              <p className="font-medium text-slate-300">In {holdingYears} years, {Math.round((finalInterestEarned / finalCompiledAmt) * 100)}% of your final portfolio wealth was created absolutely free purely by compound interest snowball loops.</p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4">
            <span className="text-[9px] text-blue-300 font-mono block leading-relaxed italic">"Compound interest is the 8th wonder of the world. He who understands it, earns it; he who doesn't, pays it." – Albert Einstein</span>
          </div>
        </div>

      </div>

      {/* Finance 101 Exploded Term List */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Finance 101 - Core Lessons for Beginners</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_EDUCATIONAL_TERMS.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <span className="font-bold text-slate-950 text-sm block">{item.term}</span>
                <p className="text-xs text-slate-500 leading-normal font-medium">{item.definition}</p>
              </div>
              <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold tracking-wider text-blue-600 font-mono">Module {idx+1}</span>
                <span className="text-[10px] text-slate-400 font-medium">1 Min Read</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
