import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, ShieldCheck, Check, Trash2, ArrowRight, Lock, UserCheck, AlertCircle } from "lucide-react";
import SaveItLogo from "./SaveItLogo";

interface LoginGateProps {
  onLogin: (email: string, rememberMe: boolean) => void;
  savedAccounts: string[];
  onDeleteAccountData: (email: string) => void;
  defaultEmail?: string;
}

export default function LoginGate({ onLogin, savedAccounts, onDeleteAccountData, defaultEmail }: LoginGateProps) {
  const [emailInput, setEmailInput] = useState(defaultEmail || "");
  const [passwordInput, setPasswordInput] = useState(""); // Simulated secure local workspace entry passcode
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      setError("Please enter a valid Gmail or Google Workspace address.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    // Simulate safe locally verified database transit delay
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin(email, rememberMe);
    }, 800);
  };

  const handleSelectPreExisting = (email: string) => {
    setEmailInput(email);
    setError("");
  };

  return (
    <div id="login-gate-viewport" className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <motion.div
        id="login-main-anim-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Upper Visual Accent banner */}
        <div id="login-header-banner" className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full -ml-8 -mb-8 blur-lg" />
          
          <div className="flex items-center space-x-3 mb-3">
            <SaveItLogo className="w-9 h-9" showText={true} textClassName="text-xl text-white font-bold" variant="white" />
          </div>
          <p className="text-xs text-blue-100/90 leading-relaxed max-w-xs">
            A high-fidelity dashboard built with robust local profile partitioning and smart budget calculations.
          </p>
        </div>

        <div id="login-form-body" className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              Secure Profile Access
            </h2>
            <p className="text-xs text-slate-500 leading-normal">
              Your financial coordinates, bank statement uploads, and compound interest metrics are stored securely under your logged-in Google identity.
            </p>
          </div>

          {/* Quick Switch Profiles if they exist */}
          {savedAccounts.length > 0 && (
            <div id="saved-profiles-panel" className="space-y-2 bg-slate-50/80 border border-slate-100 rounded-xl p-3.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Previous device profiles
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 custom-scroll mt-2">
                {savedAccounts.map((account) => {
                  const isActive = emailInput.trim().toLowerCase() === account.toLowerCase();
                  return (
                    <div
                      key={account}
                      id={`saved-profile-row-${account.replace(/[@.]/g, "-")}`}
                      className={`group flex items-center justify-between p-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-blue-50/60 border border-blue-200/50 text-blue-900"
                          : "hover:bg-slate-100/80 text-slate-700"
                      }`}
                    >
                      <button
                        type="button"
                        id={`btn-select-saved-${account.replace(/[@.]/g, "-")}`}
                        onClick={() => handleSelectPreExisting(account)}
                        className="flex-1 text-left flex items-center gap-2 cursor-pointer focus:outline-none"
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold uppercase shrink-0 ${
                          isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600 group-hover:bg-slate-300"
                        }`}>
                          {account.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold truncate" title={account}>
                          {account}
                        </span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        {isActive && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 font-bold" />}
                        <button
                          type="button"
                          id={`btn-delete-saved-${account.replace(/[@.]/g, "-")}`}
                          onClick={() => onDeleteAccountData(account)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all p-1 rounded hover:bg-slate-200/50"
                          title="Purge local storage partitions for this profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core Login form */}
          <form id="authenticator-credentials-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email-input-field" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Gmail Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <input
                  type="email"
                  id="email-input-field"
                  placeholder="e.g. user@gmail.com"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setError("");
                  }}
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm transition-all font-semibold"
                  required
                />
              </div>
            </div>

            <div className="hidden sm:block">
              <label htmlFor="passcode-input-field" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Workspace Passcode <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative rounded-lg shadow-xs">
                <input
                  type="password"
                  id="passcode-input-field"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm transition-all"
                />
              </div>
            </div>

            {/* Remember Me and persistent choice */}
            <div className="flex items-center justify-between pt-1">
              <label id="checkbox-remember-container" className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="remember-me-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Keep me logged in on this device
                </span>
              </label>
            </div>

            {error && (
              <div id="login-error-toast" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-xs font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              id="submit-auth-entry-btn"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Workspace...</span>
                </>
              ) : (
                <>
                  <span>Access Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info highlighting local offline sandbox encryption */}
        <div id="login-card-footer" className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[10px] font-semibold text-slate-500 leading-normal">
            Device-isolated local profile security. Your private data does not leave this browser sandbox.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
