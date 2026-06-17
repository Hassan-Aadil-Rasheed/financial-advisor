import React, { useState } from "react";
import { Transaction } from "../types";
import { MOCK_BANKS, MOCK_BANK_TRANSACTIONS } from "../utils/mockData";
import { ShieldCheck, Loader2, ArrowRight, CheckCircle2, ChevronRight, RefreshCw } from "lucide-react";

interface BankSyncProps {
  onSyncComplete: (newTransactions: Transaction[], bankName: string) => void;
}

export default function BankSync({ onSyncComplete }: BankSyncProps) {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [syncState, setSyncState] = useState<"idle" | "cred-entry" | "connecting" | "fetching" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setSyncState("cred-entry");
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage("Please enter simulated credential credentials to proceed.");
      return;
    }
    setErrorMessage("");
    setSyncState("connecting");

    // Cycle through simulated linking processes
    setTimeout(() => {
      setSyncState("fetching");
      setTimeout(() => {
        const bankInfo = MOCK_BANKS.find(b => b.id === selectedBank);
        const bankName = bankInfo ? bankInfo.name : "Linked Bank";
        const txs = MOCK_BANK_TRANSACTIONS[selectedBank || ""] || [];
        setSyncState("success");
        onSyncComplete(txs, bankName);
      }, 1500);
    }, 1500);
  };

  const currentBankInfo = MOCK_BANKS.find((b) => b.id === selectedBank);

  return (
    <div id="bank-sync-sandbox" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs font-sans">
      <div className="flex items-center space-x-3 mb-5">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg animate-pulse">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-950">Secure Real-Time Bank Synchronization</h3>
          <p className="text-xs text-slate-500 mt-0.5">Establish a safe sandboxed connection to automatically categorize ledger transactions.</p>
        </div>
      </div>

      {syncState === "idle" && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select your financial institution to start secure sync:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOCK_BANKS.map((bank) => (
              <button
                key={bank.id}
                id={`bank-select-${bank.id}`}
                onClick={() => handleBankSelect(bank.id)}
                className={`cursor-pointer flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-lg text-left transition-all hover:bg-slate-100 hover:scale-[1.005]`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${bank.color} ${bank.textColor}`}>
                    {bank.name.substring(0, 2)}
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">{bank.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Simulated Plaid integration environment. Your mock credentials are processed locally.</span>
          </div>
        </div>
      )}

      {syncState === "cred-entry" && currentBankInfo && (
        <form onSubmit={handleConnectSubmit} className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="font-bold text-xs text-slate-700 flex items-center gap-2">
              <span className={`w-5.5 h-5.5 rounded flex items-center justify-center text-[9px] font-bold ${currentBankInfo.color} ${currentBankInfo.textColor}`}>
                {currentBankInfo.name.substring(0, 2)}
              </span>
              Connect {currentBankInfo.name} accounts
            </span>
            <button
              type="button"
              id="back-banks-btn"
              onClick={() => setSyncState("idle")}
              className="cursor-pointer text-xs text-slate-400 hover:text-slate-800 font-semibold focus:outline-none"
            >
              Back to Banks
            </button>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Simulated Bank Online ID</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-semibold"
                placeholder="Sandbox User"
                id="bank-username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Passcode</label>
              <input
                type="password"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-semibold"
                placeholder="••••••••"
                id="bank-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {errorMessage && <p className="text-xs text-rose-500 font-medium">{errorMessage}</p>}

          <button
            type="submit"
            id="bank-submit-credentials-btn"
            className="cursor-pointer w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs border border-blue-500 transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            Initiate Secure Credentials Linking
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {(syncState === "connecting" || syncState === "fetching") && (
        <div className="py-10 flex flex-col items-center justify-center space-y-4 text-center animate-fadeIn">
          {syncState === "connecting" ? (
            <>
              <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
              <p className="font-bold text-slate-800 text-sm">Authenticating with Bank Platform APIs...</p>
              <p className="text-xs text-slate-400">Verifying secure virtual sandbox credentials</p>
            </>
          ) : (
            <>
              <RefreshCw className="w-9 h-9 text-emerald-600 animate-spin" />
              <p className="font-bold text-slate-800 text-sm">Importing recent transactions...</p>
              <p className="text-xs text-slate-400">Retrieving statement ledger rows & categorizing in real-time</p>
            </>
          )}
        </div>
      )}

      {syncState === "success" && currentBankInfo && (
        <div className="py-10 flex flex-col items-center justify-center space-y-4 text-center animate-fadeIn">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{currentBankInfo.name} Connected Successfully!</h4>
          <p className="text-xs text-slate-500 max-w-sm">We've securely imported transactions for analysis in your personal registry feed.</p>
          <button
            onClick={() => {
              setSyncState("idle");
              setUsername("");
              setPassword("");
            }}
            id="reset-bank-connection"
            className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800 focus:outline-none mt-2"
          >
            Connect another bank account
          </button>
        </div>
      )}
    </div>
  );
}
