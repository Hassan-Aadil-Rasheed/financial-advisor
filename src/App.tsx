import React, { useState, useEffect } from "react";
import { FinancialCondition, BudgetAdvice, Transaction } from "./types";
import { MOCK_BANK_TRANSACTIONS } from "./utils/mockData";
import FinanceOnboarding from "./components/FinanceOnboarding";
import Dashboard from "./components/Dashboard";
import BankSync from "./components/BankSync";
import StatementUpload from "./components/StatementUpload";
import InvestmentAdvisor from "./components/InvestmentAdvisor";
import FinancialEducation from "./components/FinancialEducation";
import LoginGate from "./components/LoginGate";
import SaveItLogo from "./components/SaveItLogo";
import { Sparkles, LayoutDashboard, ShieldCheck, UploadCloud, TrendingUp, GraduationCap, Edit3, Settings, HelpCircle, Loader2, User, Mail, ChevronDown, Check, Trash2, PlusCircle, LogOut } from "lucide-react";
import { formatMoney, convertAmount } from "./utils/currency";

export default function App() {
  // Tab handling
  const [currentTab, setCurrentTab] = useState<"dashboard" | "sync" | "upload" | "investments" | "education">("dashboard");
  const [showSettingsOnboard, setShowSettingsOnboard] = useState(false);

  // Session login control state - satisfies persistent stay-logged-in requirement
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return (localStorage.getItem("saveit_is_logged_in") || localStorage.getItem("finstable_is_logged_in")) === "true";
  });

  // Active Gmail account identity partition
  const [gmailAccount, setGmailAccount] = useState<string>(() => {
    return localStorage.getItem("saveit_active_gmail") || localStorage.getItem("finstable_active_gmail") || "hassanaadilrasheed12@gmail.com";
  });

  // Multiple user profile list for testing/switching
  const [accountsList, setAccountsList] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("saveit_gmail_accounts_list") || localStorage.getItem("finstable_gmail_accounts_list");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.includes("hassanaadilrasheed12@gmail.com")) {
            parsed.push("hassanaadilrasheed12@gmail.com");
          }
          return parsed;
        }
      }
    } catch (e) {}
    return ["hassanaadilrasheed12@gmail.com"];
  });

  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [newGmailInput, setNewGmailInput] = useState("");
  const [switchError, setSwitchError] = useState("");

  // Core financial profile conditions
  const [condition, setCondition] = useState<FinancialCondition>(() => {
    const activeEmail = localStorage.getItem("saveit_active_gmail") || localStorage.getItem("finstable_active_gmail") || "hassanaadilrasheed12@gmail.com";
    const savedProfile = localStorage.getItem(`saveit_profile_${activeEmail}`) || localStorage.getItem(`finstable_profile_${activeEmail}`);
    if (savedProfile) {
      try { return JSON.parse(savedProfile); } catch (e) {}
    }
    return {
      monthlyIncome: 4500,
      fixedExpenses: 1800,
      variableExpenses: 1200,
      currentSavings: 2500,
      savingsGoal: {
        targetAmount: 10000,
        targetDate: "2027-06",
      },
      riskTolerance: "medium",
      currencyCode: "USD",
    };
  });

  // Budget advice response
  const [advice, setAdvice] = useState<BudgetAdvice | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);

  // Integrated transaction registry (Pre-seeded with Chase bank mock logs so the dashboard is robust on arrival)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const activeEmail = localStorage.getItem("saveit_active_gmail") || localStorage.getItem("finstable_active_gmail") || "hassanaadilrasheed12@gmail.com";
    const savedTxs = localStorage.getItem(`saveit_txs_${activeEmail}`) || localStorage.getItem(`finstable_txs_${activeEmail}`);
    if (savedTxs) {
      try { return JSON.parse(savedTxs); } catch (e) {}
    }
    return MOCK_BANK_TRANSACTIONS.chase;
  });

  // Core engine triggers
  const fetchAdvice = async (profile: FinancialCondition) => {
    setIsAdviceLoading(true);
    try {
      const response = await fetch("/api/analyze-condition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const rawText = await response.text();
      if (!rawText) {
        throw new Error("Empty response body");
      }

      const data = contentType.includes("application/json")
        ? JSON.parse(rawText)
        : JSON.parse(rawText);

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response payload");
      }

      setAdvice(data);
    } catch (err) {
      console.error("Failed to connect with budget calculation daemon:", err);
      setAdvice(null);
    } finally {
      setIsAdviceLoading(false);
    }
  };

  // Synchronize load caches on switch
  useEffect(() => {
    localStorage.setItem("saveit_active_gmail", gmailAccount);
    localStorage.setItem("finstable_active_gmail", gmailAccount);

    const savedProfile = localStorage.getItem(`saveit_profile_${gmailAccount}`) || localStorage.getItem(`finstable_profile_${gmailAccount}`);
    let loadedProfile: FinancialCondition = {
      monthlyIncome: 4500,
      fixedExpenses: 1800,
      variableExpenses: 1200,
      currentSavings: 2500,
      savingsGoal: {
        targetAmount: 10000,
        targetDate: "2027-06",
      },
      riskTolerance: "medium",
      currencyCode: "USD",
    };
    if (savedProfile) {
      try {
        loadedProfile = JSON.parse(savedProfile);
      } catch (e) {}
    }
    setCondition(loadedProfile);

    const savedTxs = localStorage.getItem(`saveit_txs_${gmailAccount}`) || localStorage.getItem(`finstable_txs_${gmailAccount}`);
    let loadedTxs = MOCK_BANK_TRANSACTIONS.chase;
    if (savedTxs) {
      try {
        loadedTxs = JSON.parse(savedTxs);
      } catch (e) {}
    } else {
      localStorage.setItem(`saveit_txs_${gmailAccount}`, JSON.stringify(loadedTxs));
      localStorage.setItem(`finstable_txs_${gmailAccount}`, JSON.stringify(loadedTxs));
    }
    setTransactions(loadedTxs);

    fetchAdvice(loadedProfile);
  }, [gmailAccount]);

  const handleUpdateCondition = (newCondition: FinancialCondition) => {
    const oldCode = condition.currencyCode || "USD";
    const newCode = newCondition.currencyCode || "USD";
    let updatedTxs = transactions;
    if (oldCode !== newCode) {
      updatedTxs = transactions.map((tx) => ({
        ...tx,
        amount: parseFloat((tx.amount * (convertAmount(1, oldCode, newCode) || 1)).toFixed(2)),
      }));
      setTransactions(updatedTxs);
      localStorage.setItem(`saveit_txs_${gmailAccount}`, JSON.stringify(updatedTxs));
      localStorage.setItem(`finstable_txs_${gmailAccount}`, JSON.stringify(updatedTxs));
    }
    setCondition(newCondition);
    localStorage.setItem(`saveit_profile_${gmailAccount}`, JSON.stringify(newCondition));
    localStorage.setItem(`finstable_profile_${gmailAccount}`, JSON.stringify(newCondition));
    fetchAdvice(newCondition);
    setShowSettingsOnboard(false);
  };

  // Add customized transaction
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => {
      const next = [newTx, ...prev];
      localStorage.setItem(`saveit_txs_${gmailAccount}`, JSON.stringify(next));
      localStorage.setItem(`finstable_txs_${gmailAccount}`, JSON.stringify(next));
      return next;
    });
  };

  // Append batch transactions from syncing
  const handleBankSyncComplete = (newTxs: Transaction[], bankName: string) => {
    setTransactions((prev) => {
      const next = [...newTxs, ...prev];
      localStorage.setItem(`saveit_txs_${gmailAccount}`, JSON.stringify(next));
      localStorage.setItem(`finstable_txs_${gmailAccount}`, JSON.stringify(next));
      return next;
    });
    // Notify user elegantly
    setTimeout(() => {
      setCurrentTab("dashboard");
    }, 1200);
  };

  // Parse statement uploads
  const handleStatementUploadSuccess = (newTxs: Transaction[]) => {
    // 1. Calculate financial variables based on actual items in the statement
    const statementIncome = newTxs
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const statementFixed = newTxs
      .filter((tx) => tx.type === "expense" && (tx.category === "Housing" || tx.category === "Utilities & Bills"))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const statementVariable = newTxs
      .filter((tx) => tx.type === "expense" && tx.category !== "Housing" && tx.category !== "Utilities & Bills")
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Create updated condition
    const updatedCondition = {
      ...condition,
      monthlyIncome: statementIncome > 0 ? parseFloat(statementIncome.toFixed(2)) : condition.monthlyIncome,
      fixedExpenses: statementFixed > 0 ? parseFloat(statementFixed.toFixed(2)) : condition.fixedExpenses,
      variableExpenses: statementVariable > 0 ? parseFloat(statementVariable.toFixed(2)) : condition.variableExpenses,
    };

    // Update state & persist
    setCondition(updatedCondition);
    localStorage.setItem(`saveit_profile_${gmailAccount}`, JSON.stringify(updatedCondition));
    localStorage.setItem(`finstable_profile_${gmailAccount}`, JSON.stringify(updatedCondition));

    // 2. Prepend transactions so the tables & charts show them
    setTransactions((prev) => {
      const next = [...newTxs, ...prev];
      localStorage.setItem(`saveit_txs_${gmailAccount}`, JSON.stringify(next));
      localStorage.setItem(`finstable_txs_${gmailAccount}`, JSON.stringify(next));
      return next;
    });

    // 3. Immediately trigger Gemini advice rebuild with the actual data
    fetchAdvice(updatedCondition);

    setTimeout(() => {
      setCurrentTab("dashboard");
    }, 1500);
  };

  const handleAddNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newGmailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSwitchError("Please enter a valid Gmail address.");
      return;
    }

    setSwitchError("");
    let updatedList = [...accountsList];
    if (!updatedList.includes(email)) {
      updatedList.push(email);
      setAccountsList(updatedList);
      localStorage.setItem("saveit_gmail_accounts_list", JSON.stringify(updatedList));
      localStorage.setItem("finstable_gmail_accounts_list", JSON.stringify(updatedList));
    }

    setGmailAccount(email);
    setNewGmailInput("");
    setShowSwitchDropdown(false);
  };

  const handleDeleteAccountData = (emailToDelete: string) => {
    if (emailToDelete === gmailAccount) {
      setSwitchError("Cannot clear the active account.");
      return;
    }
    localStorage.removeItem(`saveit_profile_${emailToDelete}`);
    localStorage.removeItem(`saveit_txs_${emailToDelete}`);
    localStorage.removeItem(`finstable_profile_${emailToDelete}`);
    localStorage.removeItem(`finstable_txs_${emailToDelete}`);

    const updatedList = accountsList.filter((email) => email !== emailToDelete);
    setAccountsList(updatedList);
    localStorage.setItem("saveit_gmail_accounts_list", JSON.stringify(updatedList));
    localStorage.setItem("finstable_gmail_accounts_list", JSON.stringify(updatedList));
  };

  if (!isLoggedIn) {
    return (
      <LoginGate
        onLogin={(email, remember) => {
          setGmailAccount(email);
          if (remember) {
            localStorage.setItem("saveit_is_logged_in", "true");
            localStorage.setItem("finstable_is_logged_in", "true");
          } else {
            // Transient session
            localStorage.setItem("saveit_is_logged_in", "false");
            localStorage.setItem("finstable_is_logged_in", "false");
          }
          localStorage.setItem("saveit_active_gmail", email);
          localStorage.setItem("finstable_active_gmail", email);
          
          let updatedList = [...accountsList];
          if (!updatedList.includes(email)) {
            updatedList.push(email);
            setAccountsList(updatedList);
            localStorage.setItem("saveit_gmail_accounts_list", JSON.stringify(updatedList));
            localStorage.setItem("finstable_gmail_accounts_list", JSON.stringify(updatedList));
          }
          setIsLoggedIn(true);
        }}
        savedAccounts={accountsList.filter(email => email !== "hassanaadilrasheed12@gmail.com")}
        onDeleteAccountData={(email) => {
          localStorage.removeItem(`saveit_profile_${email}`);
          localStorage.removeItem(`saveit_txs_${email}`);
          localStorage.removeItem(`finstable_profile_${email}`);
          localStorage.removeItem(`finstable_txs_${email}`);
          
          const updatedList = accountsList.filter((a) => a !== email);
          setAccountsList(updatedList);
          localStorage.setItem("saveit_gmail_accounts_list", JSON.stringify(updatedList));
          localStorage.setItem("finstable_gmail_accounts_list", JSON.stringify(updatedList));
          
          if (email === gmailAccount) {
            setGmailAccount("hassanaadilrasheed12@gmail.com");
            localStorage.setItem("saveit_active_gmail", "hassanaadilrasheed12@gmail.com");
            localStorage.setItem("finstable_active_gmail", "hassanaadilrasheed12@gmail.com");
          }
        }}
        defaultEmail={gmailAccount === "hassanaadilrasheed12@gmail.com" ? "" : gmailAccount}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-4 w-full lg:w-auto">
            <SaveItLogo className="w-8 h-8" showText={true} textClassName="text-xl font-bold font-sans text-slate-900" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-bold font-mono uppercase tracking-wider">AI Assistant</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Geometric Balance budgeting suite</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto lg:justify-end">
            {/* Quick Stats Summary ribbon */}
            <div className="flex items-center space-x-4 text-xs text-slate-600 bg-white border border-slate-200 py-2.5 px-4 rounded-xl shadow-xs w-full sm:w-auto justify-between sm:justify-start">
              <div className="px-1 text-slate-700">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Income Inflow</span>
                <span className="text-xs font-bold text-slate-900">{formatMoney(condition.monthlyIncome, condition.currencyCode || "USD")}/mo</span>
              </div>
              <div className="border-l border-slate-200 h-6" />
              <div className="px-1 text-slate-700">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Outflow Budget</span>
                <span className="text-xs font-bold text-slate-900">{formatMoney(condition.fixedExpenses + condition.variableExpenses, condition.currencyCode || "USD")}/mo</span>
              </div>
              <div className="border-l border-slate-200 h-6" />
              <div className="px-1 text-slate-700">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Buffer</span>
                <span className={`text-xs font-bold ${condition.monthlyIncome - condition.fixedExpenses - condition.variableExpenses >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {condition.monthlyIncome - condition.fixedExpenses - condition.variableExpenses >= 0 ? "+" : ""}{formatMoney(condition.monthlyIncome - condition.fixedExpenses - condition.variableExpenses, condition.currencyCode || "USD")}/mo
                </span>
              </div>
              <button
                onClick={() => setShowSettingsOnboard(true)}
                id="reconfigure-profile-btn"
                className="cursor-pointer font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 focus:outline-none pl-3 border-l border-slate-200 text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> Adjust Goals
              </button>
            </div>

            {/* Gmail Account Switcher Dropdown */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
                className="cursor-pointer flex items-center justify-between sm:justify-start gap-2.5 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors border border-slate-200 p-2.5 rounded-xl w-full text-left focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] uppercase shrink-0">
                    {gmailAccount.charAt(0)}
                  </div>
                  <div className="max-w-[150px] truncate">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight leading-none">Gmail Account Profile</span>
                    <span className="block text-xs font-bold text-slate-700 truncate mt-0.5" title={gmailAccount}>{gmailAccount}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {showSwitchDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4 space-y-3.5 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-2.5">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Current active ledger</span>
                    <div className="flex items-center space-x-2 mt-1.5 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50">
                      <div className="w-6 h-6 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] uppercase shrink-0">
                        {gmailAccount.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate" title={gmailAccount}>{gmailAccount}</span>
                    </div>
                  </div>

                  {/* Saved Gmail Ledgers */}
                  <div className="space-y-1.5">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Select active Google account</span>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scroll">
                      {accountsList.map((email) => (
                        <div key={email} className="group flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                          <button
                            onClick={() => {
                              setGmailAccount(email);
                              setShowSwitchDropdown(false);
                            }}
                            className="flex-1 text-left text-xs font-semibold text-slate-600 hover:text-slate-900 focus:outline-none truncate"
                          >
                            {email}
                          </button>
                          {email === gmailAccount ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1.5 font-bold" />
                          ) : (
                            <button
                              onClick={() => handleDeleteAccountData(email)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity focus:opacity-100 p-0.5"
                              title="Delete profile data"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Register alternative Gmail */}
                  <form onSubmit={handleAddNewAccount} className="pt-2.5 border-t border-slate-100 space-y-1.5">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Add or switch Gmail ledger</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. user@gmail.com"
                        value={newGmailInput}
                        onChange={(e) => {
                          setNewGmailInput(e.target.value);
                          setSwitchError("");
                        }}
                        className="flex-1 min-w-0 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-center shrink-0"
                      >
                        Add
                      </button>
                    </div>
                    {switchError && (
                      <span className="block text-[9px] font-bold text-rose-500 leading-normal">{switchError}</span>
                    )}
                  </form>

                  {/* Dynamic Logout Action - matches improved login requirement */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col pt-2.5">
                    <button
                      type="button"
                      id="action-dropdown-signout"
                      onClick={() => {
                        localStorage.removeItem("saveit_is_logged_in");
                        localStorage.removeItem("finstable_is_logged_in");
                        setIsLoggedIn(false);
                        setShowSwitchDropdown(false);
                      }}
                      className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus:outline-none"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out of Gmail Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Main Core View Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {/* Onboarding Dialog/Component overlay if triggered */}
        {showSettingsOnboard ? (
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Update Financial Coordinates</h3>
              <button
                onClick={() => setShowSettingsOnboard(false)}
                className="cursor-pointer text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Close Settings
              </button>
            </div>
            <FinanceOnboarding onComplete={handleUpdateCondition} initialData={condition} />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Horizontal Segment Navigation buttons */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto gap-1 shadow-xs">
              <button
                onClick={() => setCurrentTab("dashboard")}
                id="tab-dashboard"
                className={`cursor-pointer px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-2 whitespace-nowrap transition-all ${
                  currentTab === "dashboard"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Optimizing Advice & Dashboard
              </button>
              <button
                onClick={() => setCurrentTab("sync")}
                id="tab-sync"
                className={`cursor-pointer px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-2 whitespace-nowrap transition-all ${
                  currentTab === "sync"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Real-time Bank Syncing
              </button>
              <button
                onClick={() => setCurrentTab("upload")}
                id="tab-upload"
                className={`cursor-pointer px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-2 whitespace-nowrap transition-all ${
                  currentTab === "upload"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <UploadCloud className="w-4 h-4" /> Monthly Statement Drop
              </button>
              <button
                onClick={() => setCurrentTab("investments")}
                id="tab-investments"
                className={`cursor-pointer px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-2 whitespace-nowrap transition-all ${
                  currentTab === "investments"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Side-by-Side Investment Guide
              </button>
              <button
                onClick={() => setCurrentTab("education")}
                id="tab-education"
                className={`cursor-pointer px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-2 whitespace-nowrap transition-all ${
                  currentTab === "education"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Compound Wealth Visualizer
              </button>
            </div>

            {/* Render Active Tab content */}
            {isAdviceLoading && currentTab === "dashboard" ? (
              <div id="loader-fallback-container" className="py-32 flex flex-col items-center justify-center space-y-4 bg-white border border-slate-200 rounded-xl p-8 shadow-xs">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="font-semibold text-slate-800">Connecting securely with Gemini Advisor Daemon...</p>
                <p className="text-xs text-slate-400">Compiling financial metrics and budgeting allocation curves</p>
              </div>
            ) : (
              <div id="active-panel-frame" className="transition-all duration-300 animate-fadeIn">
                {currentTab === "dashboard" && advice && (
                  <Dashboard
                    condition={condition}
                    advice={advice}
                    transactions={transactions}
                    onAddTransaction={handleAddTransaction}
                  />
                )}
                {currentTab === "sync" && (
                  <BankSync onSyncComplete={handleBankSyncComplete} />
                )}
                {currentTab === "upload" && (
                  <StatementUpload onUploadSuccess={handleStatementUploadSuccess} />
                )}
                {currentTab === "investments" && (
                  <InvestmentAdvisor condition={condition} />
                )}
                {currentTab === "education" && (
                  <FinancialEducation currencyCode={condition.currencyCode} />
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Humble educational footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-slate-500 text-xs shadow-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-medium text-slate-500">Last synced: 2 minutes ago • UTC: 2026-05-31</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure FDIC-Insured Compound Savings Simulation environment. APYs subject to market rates.</span>
          </span>
        </div>
      </footer>

    </div>
  );
}
