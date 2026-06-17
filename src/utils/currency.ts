import { CurrencyCode } from "../types";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // Conversion rate relative to 1 USD
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar ($)", rate: 1.0 },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee (₹)", rate: 83.3 },
  PKR: { code: "PKR", symbol: "₨", name: "Pakistani Rupee (₨)", rate: 278.5 },
  EUR: { code: "EUR", symbol: "€", name: "Euro (€)", rate: 0.92 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound (£)", rate: 0.79 },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar (C$)", rate: 1.36 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar (A$)", rate: 1.51 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham (د.إ)", rate: 3.67 },
  SAR: { code: "SAR", symbol: "ر.س", name: "Saudi Riyal (ر.س)", rate: 3.75 },
};

export function getCurrencyInfo(code?: CurrencyCode): CurrencyInfo {
  return CURRENCIES[code || "USD"] || CURRENCIES.USD;
}

export function formatMoney(amount: number, code?: CurrencyCode): string {
  const currency = getCurrencyInfo(code);
  return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatMoneyDecimals(amount: number, code?: CurrencyCode): string {
  const currency = getCurrencyInfo(code);
  return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const fromRate = CURRENCIES[from]?.rate || 1.0;
  const toRate = CURRENCIES[to]?.rate || 1.0;
  // Convert from input currency to USD base, then multiply by target rate
  const usdBase = amount / fromRate;
  return Math.round(usdBase * toRate);
}
