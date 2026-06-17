import React, { useState } from "react";
import { Transaction, BudgetCategory } from "../types";
import { SAMPLE_STATEMENT_CSV } from "../utils/mockData";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Loader2, 
  FileDown, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  Trash2, 
  Check, 
  ArrowRight, 
  HelpCircle,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { formatMoney } from "../utils/currency";

interface StatementUploadProps {
  onUploadSuccess: (newTransactions: Transaction[]) => void;
}

export default function StatementUpload({ onUploadSuccess }: StatementUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [statementText, setStatementText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  
  // Staging area so the user can see, adjust, and approve transactions before adding them
  const [stagedTxs, setStagedTxs] = useState<Transaction[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number } | null>(null);
  const [pdfAttachment, setPdfAttachment] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
  const [sortBy, setSortBy] = useState<"category" | "date" | "amount" | "type">("category");
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successImported, setSuccessImported] = useState<boolean>(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile({ name: file.name, size: file.size });
      parseFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile({ name: file.name, size: file.size });
      parseFile(file);
    }
  };

  const parseFile = (file: File) => {
    setErrorMsg(null);
    setSuccessImported(false);
    setPdfAttachment(null);
    setStagedTxs([]);

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        if (isPdf) {
          const resultStr = event.target.result as string;
          const base64Part = resultStr.split(",")[1];
          setPdfAttachment({
            base64: base64Part,
            mimeType: "application/pdf",
            name: file.name
          });
          setStatementText(`[PDF Document Statement Attached: "${file.name}"]\nReady for AI extraction.`);
          setParsedCount(null);
        } else {
          const textContent = event.target.result as string;
          setStatementText(textContent);
          
          // Instantly run the highly robust, dynamic CSV helper
          const parsed = parseCSVLocally(textContent);
          if (parsed.length > 0) {
            setStagedTxs(parsed);
            setParsedCount(parsed.length);
            setErrorMsg(null);
          } else {
            setErrorMsg("We detected your CSV file but couldn't parse any readable transaction rows. Ensure your CSV lists values under standard headers like 'Date', 'Description' or 'Amount'.");
          }
        }
      }
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read statement file.");
    };

    if (isPdf) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  // Immediate local client-side parsing fallback for robustness
  const parseCSVLocally = (text: string): Transaction[] => {
    const lines = (text || "").split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    // Helper to safely split standard double-quoted CSV fields
    const splitCSVLine = (line: string, delim: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delim && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    // Auto-detect CSV delimiter (, or ; or \t)
    let delimiter = ",";
    let commasCount = 0;
    let semicolonsCount = 0;
    let tabsCount = 0;
    const testLines = lines.slice(0, 5);
    testLines.forEach(l => {
      commasCount += (l.match(/,/g) || []).length;
      semicolonsCount += (l.match(/;/g) || []).length;
      tabsCount += (l.match(/\t/g) || []).length;
    });
    if (semicolonsCount > commasCount && semicolonsCount > tabsCount) delimiter = ";";
    if (tabsCount > commasCount && tabsCount > semicolonsCount) delimiter = "\t";

    let headerIdx = -1;
    let dateIdx = -1;
    let descIdx = -1;
    let amountIdx = -1;
    let debitIdx = -1;
    let creditIdx = -1;
    let typeIdx = -1;
    let categoryIdx = -1;

    // Search scanning header line in first 10 rows
    const maxSearchHeader = Math.min(lines.length, 10);
    for (let h = 0; h < maxSearchHeader; h++) {
      const cells = splitCSVLine(lines[h], delimiter);
      let foundDate = -1;
      let foundDesc = -1;
      let foundAmount = -1;
      let foundDebit = -1;
      let foundCredit = -1;
      let foundType = -1;
      let foundCategory = -1;

      cells.forEach((cell, idx) => {
        const clean = cell.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
        if (/date|time|day|posted|trans.*dt/i.test(clean)) {
          foundDate = idx;
        } else if (/desc|merchant|name|payee|detail|title/i.test(clean)) {
          foundDesc = idx;
        } else if (/amount|charge|value|sum|cost|price|total/i.test(clean)) {
          foundAmount = idx;
        } else if (/debit|withdrawal|payment|expense|^out$/i.test(clean) || clean.includes("moneyout")) {
          foundDebit = idx;
        } else if (/credit|deposit|refund|receipt|income|^in$/i.test(clean) || clean.includes("moneyin")) {
          foundCredit = idx;
        } else if (/type|dc|tx.*type/i.test(clean)) {
          foundType = idx;
        } else if (/category|class|group/i.test(clean)) {
          foundCategory = idx;
        }
      });

      if ((foundDate !== -1 && foundAmount !== -1) || 
          (foundDate !== -1 && foundDesc !== -1) || 
          (foundDate !== -1 && foundDebit !== -1)) {
        headerIdx = h;
        dateIdx = foundDate;
        descIdx = foundDesc !== -1 ? foundDesc : 1;
        amountIdx = foundAmount !== -1 ? foundAmount : -1;
        debitIdx = foundDebit;
        creditIdx = foundCredit;
        typeIdx = foundType;
        categoryIdx = foundCategory;
        break;
      }
    }

    // Default hardcoded index fallback if header row is undetected
    if (headerIdx === -1) {
      const firstLineCells = splitCSVLine(lines[0], delimiter);
      dateIdx = 0;
      descIdx = 1;
      amountIdx = 2;

      firstLineCells.forEach((cell, idx) => {
        const cleanVal = cell.replace(/"/g, "").trim();
        if (/^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/.test(cleanVal)) {
          dateIdx = idx;
        } else if (!isNaN(parseFloat(cleanVal.replace(/[^0-9.-]/g, "")))) {
          amountIdx = idx;
        } else if (cleanVal.length > 3 && descIdx === 1) {
          descIdx = idx;
        }
      });
      if (descIdx === dateIdx) descIdx = dateIdx === 0 ? 1 : 0;
      if (amountIdx === dateIdx || amountIdx === descIdx) {
        for (let idx = 0; idx < firstLineCells.length; idx++) {
          if (idx !== dateIdx && idx !== descIdx) {
            amountIdx = idx;
            break;
          }
        }
      }
    }

    const results: Transaction[] = [];
    const beginRow = headerIdx !== -1 ? headerIdx + 1 : 0;

    for (let i = beginRow; i < lines.length; i++) {
      const cells = splitCSVLine(lines[i], delimiter);
      if (cells.length === 0 || cells.join("").trim() === "") continue;

      // Skip possible trailing header row matches or mismatch lines
      if (cells[dateIdx]?.toLowerCase().includes("date")) continue;

      const rawDateVal = cells[dateIdx]?.replace(/"/g, "").trim() || "";
      let cleanDate = rawDateVal;
      if (rawDateVal) {
        const slashParts = rawDateVal.split(/[-/.]/);
        if (slashParts.length === 3) {
          let y = slashParts[2];
          let m = slashParts[0];
          let d = slashParts[1];
          if (y.length === 2) y = "20" + y;
          if (m.length === 1) m = "0" + m;
          if (d.length === 1) d = "0" + d;
          if (slashParts[0].length === 4) {
            cleanDate = `${slashParts[0]}-${slashParts[1].padStart(2, "0")}-${slashParts[2].padStart(2, "0")}`;
          } else {
            cleanDate = `${y}-${m}-${d}`;
          }
        }
      }
      if (!cleanDate || !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
        cleanDate = new Date().toISOString().split("T")[0];
      }

      const description = cells[descIdx]?.replace(/"/g, "").trim() || "Card Merchant Purchase";
      
      let amount = 0;
      let type: "income" | "expense" = "expense";

      if (debitIdx !== -1 || creditIdx !== -1) {
        const rawDebit = debitIdx !== -1 && debitIdx < cells.length ? cells[debitIdx]?.replace(/[^\d.-]/g, "") : "";
        const rawCredit = creditIdx !== -1 && creditIdx < cells.length ? cells[creditIdx]?.replace(/[^\d.-]/g, "") : "";
        
        const parsePrice = (val: string) => {
          if (!val) return null;
          const cleanVal = val.replace(/,/g, "").trim();
          if (cleanVal === "" || cleanVal === "-") return null;
          const p = parseFloat(cleanVal);
          return isNaN(p) ? null : Math.abs(p);
        };

        const debitAmt = parsePrice(rawDebit);
        const creditAmt = parsePrice(rawCredit);

        if (debitAmt !== null && debitAmt > 0) {
          amount = debitAmt;
          type = "expense";
        } else if (creditAmt !== null && creditAmt > 0) {
          amount = creditAmt;
          type = "income";
        } else {
          const rawAmtVal = amountIdx !== -1 && amountIdx < cells.length ? cells[amountIdx]?.replace(/[^\d.-]/g, "") || "0" : "0";
          amount = Math.abs(parseFloat(rawAmtVal)) || 0;
          type = "expense";
        }
      } else {
        const rawAmtVal = amountIdx !== -1 && amountIdx < cells.length ? cells[amountIdx]?.replace(/[^\d.-]/g, "") || "0" : "0";
        amount = parseFloat(rawAmtVal);
        if (isNaN(amount)) amount = 0;

        if (amount < 0) {
          type = "expense";
          amount = Math.abs(amount);
        } else {
          type = "expense";
        }
      }

      // Read explicit type column if exists, otherwise fallback to check description for income
      if (typeIdx !== -1 && typeIdx < cells.length && cells[typeIdx]) {
        const typeStr = cells[typeIdx].toLowerCase();
        if (typeStr.includes("income") || typeStr.includes("dep") || typeStr.includes("cred")) {
          type = "income";
        }
      } else if (debitIdx === -1 && creditIdx === -1) {
        const descLower = description.toLowerCase();
        if (descLower.includes("payroll") || descLower.includes("direct deposit") || descLower.includes("salary") || descLower.includes("venmo deposit") || descLower.includes("payout") || descLower.includes("refund") || descLower.includes("payment thank you")) {
          type = "income";
        }
      }

      amount = Math.abs(amount);
      if (amount === 0) continue;

      // Apply highly accurate rule-based categorization fallback logic
      let category: BudgetCategory = "Shopping";
      const descLower = description.toLowerCase();
      if (descLower.includes("payment") || descLower.includes("thank you")) {
        category = "Other";
      } else if (descLower.includes("rent") || descLower.includes("apartment") || descLower.includes("mortgage") || descLower.includes("housing") || descLower.includes("landlord")) {
        category = "Housing";
      } else if (descLower.includes("gas") || descLower.includes("fuel") || descLower.includes("uber") || descLower.includes("commute") || descLower.includes("chevron") || descLower.includes("transit") || descLower.includes("shell") || descLower.includes("mobil") || descLower.includes("exxon") || descLower.includes("lyft") || descLower.includes("taxi")) {
        category = "Transportation";
      } else if (descLower.includes("grocery") || descLower.includes("kroger") || descLower.includes("costco") || descLower.includes("food") || descLower.includes("supermarket") || descLower.includes("trader joe") || descLower.includes("market") || descLower.includes("safeway") || descLower.includes("whole foods")) {
        category = "Food & Groceries";
      } else if (descLower.includes("dining") || descLower.includes("sushi") || descLower.includes("restaurant") || descLower.includes("starbucks") || descLower.includes("coffee") || descLower.includes("cafe") || descLower.includes("bites") || descLower.includes("deli") || descLower.includes("mcdonald") || descLower.includes("pizza") || descLower.includes("pub") || descLower.includes("bar") || descLower.includes("cinema") || descLower.includes("theater")) {
        category = "Entertainment & Dining";
      } else if (descLower.includes("netflix") || descLower.includes("spotify") || descLower.includes("hbo") || descLower.includes("utility") || descLower.includes("electric") || descLower.includes("water") || descLower.includes("subscription") || descLower.includes("bill") || descLower.includes("insurance") || descLower.includes("copay")) {
        category = "Utilities & Bills";
      } else if (descLower.includes("stock") || descLower.includes("invest") || descLower.includes("fidelity") || descLower.includes("index") || descLower.includes("etf") || descLower.includes("vanguard") || descLower.includes("schwab")) {
        category = "Investments";
      } else if (type === "income" || descLower.includes("salary") || descLower.includes("payroll") || descLower.includes("payout")) {
        category = "Savings";
      }

      results.push({
        id: "local-" + i + "-" + Date.now(),
        date: cleanDate,
        description,
        amount,
        type,
        category
      });
    }

    return results;
  };

  const convertToCSVString = (txs: Transaction[]): string => {
    const header = "Date,Description,Amount,Type,Category\n";
    const rows = txs.map(tx => {
      const cleanDesc = tx.description.includes(',') ? `"${tx.description.replace(/"/g, '""')}"` : tx.description;
      return `${tx.date},${cleanDesc},${tx.amount},${tx.type},${tx.category}`;
    }).join("\n");
    return header + rows;
  };

  const executeStatementAnalysis = async (textToParse: string) => {
    if (!textToParse.trim() && !pdfAttachment) {
      setErrorMsg("Please add, paste table, or upload a statement file first.");
      return;
    }

    setIsParsing(true);
    setParsedCount(null);
    setErrorMsg(null);
    setSuccessImported(false);

    const wasPdf = !!pdfAttachment;

    try {
      const response = await fetch("/api/analyze-statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          statementText: pdfAttachment ? "" : textToParse,
          fileData: pdfAttachment 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Server responded with error code");
      }

      const rawText = await response.text();
      let data;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        throw new Error("Server returned a non-JSON response");
      }
      
      if (Array.isArray(data) && data.length > 0) {
        const mapped: Transaction[] = data.map((item: any, index: number) => ({
          id: "stmt-ai-" + index + "-" + Date.now(),
          date: item.date || new Date().toISOString().split("T")[0],
          description: item.description || "Unidentified Merchant",
          amount: Math.abs(parseFloat(item.amount)) || 10,
          type: item.type === "income" ? "income" : "expense",
          category: (item.category as BudgetCategory) || "Other"
        }));
        setStagedTxs(mapped);
        setParsedCount(mapped.length);
        if (wasPdf) {
          setStatementText(convertToCSVString(mapped));
          setPdfAttachment(null); // Now converted into plain-text CSV
        }
      } else {
        // Safe robust local regex parser fallback in case response format is unexpected
        const fallbackLocal = parseCSVLocally(textToParse);
        if (fallbackLocal.length > 0) {
          setStagedTxs(fallbackLocal);
          setParsedCount(fallbackLocal.length);
          if (wasPdf) {
            setStatementText(convertToCSVString(fallbackLocal));
            setPdfAttachment(null);
          }
        } else {
          setErrorMsg("Could not detect tabular rows. Try a standard CSV layout or paste values.");
        }
      }
    } catch (error) {
      console.warn("API call failed, running responsive offline CSV parser...");
      const fallbackLocal = parseCSVLocally(textToParse);
      if (fallbackLocal.length > 0) {
        setStagedTxs(fallbackLocal);
        setParsedCount(fallbackLocal.length);
        if (wasPdf) {
          setStatementText(convertToCSVString(fallbackLocal));
          setPdfAttachment(null);
        }
      } else {
        setErrorMsg("Parsing failed. Please verify raw CSV syntax structure.");
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadSample = () => {
    setStatementText(SAMPLE_STATEMENT_CSV);
    setSelectedFile({ name: "sample_credit_statement.csv", size: SAMPLE_STATEMENT_CSV.length });
    setPdfAttachment(null);
    setParsedCount(null);
    setErrorMsg(null);
    setSuccessImported(false);
    setStagedTxs([]);
  };

  const handleCommitUpload = () => {
    if (stagedTxs.length === 0) return;
    onUploadSuccess(stagedTxs);
    setSuccessImported(true);
    setStagedTxs([]);
    setParsedCount(null);
    setSelectedFile(null);
    setPdfAttachment(null);
    setStatementText("");
  };

  const handleRemoveStagedItem = (id: string) => {
    const updated = stagedTxs.filter(item => item.id !== id);
    setStagedTxs(updated);
    setParsedCount(updated.length);
  };

  const getSortedStagedTxs = () => {
    const list = [...stagedTxs];
    return list.sort((a, b) => {
      if (sortBy === "category") {
        return a.category.localeCompare(b.category);
      }
      if (sortBy === "date") {
        return b.date.localeCompare(a.date);
      }
      if (sortBy === "amount") {
        return b.amount - a.amount;
      }
      if (sortBy === "type") {
        return b.type.localeCompare(a.type);
      }
      return 0;
    });
  };

  return (
    <div id="statement-upload-component" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <UploadCloud className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950">Bank Statement Intelligent Extractor</h3>
            <p className="text-xs text-slate-500 mt-0.5">Drag-and-drop CSV or PDF statements or paste raw financial ledger lines here.</p>
          </div>
        </div>

        <button
          onClick={handleLoadSample}
          id="load-sample-statement"
          className="cursor-pointer self-start sm:self-auto text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-200/50 text-xs font-bold inline-flex items-center gap-1.5 focus:outline-none transition-all"
        >
          <FileDown className="w-3.5 h-3.5" /> Load Demo CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Choose File Box */}
        <div className="space-y-4 flex flex-col justify-start">
          <div className="text-xs font-bold text-slate-700">1. Select Statement PDF or CSV File</div>
          
          <label
            htmlFor="statement-file-input"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`cursor-pointer min-h-[200px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              dragActive 
                ? "border-blue-500 bg-blue-50/20" 
                : selectedFile 
                  ? "border-emerald-300 bg-emerald-50/10"
                  : "border-slate-300 hover:border-slate-400 bg-slate-50/70"
            }`}
          >
            <input
              type="file"
              id="statement-file-input"
              className="hidden"
              accept=".csv,.txt,.json,.tsv,.pdf"
              onChange={handleFileInput}
            />
            
            {selectedFile ? (
              <div className="w-full text-center flex flex-col items-center p-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <Check className="w-6 h-6 stroke-[3px]" />
                </div>
                <p className="text-xs font-extrabold text-slate-900 break-all">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Type: {selectedFile.name.split('.').pop()?.toUpperCase()} • {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedFile(null);
                    setPdfAttachment(null);
                    setStatementText("");
                    setParsedCount(null);
                    setErrorMsg(null);
                    setStagedTxs([]);
                  }}
                  className="mt-4 px-3 py-1 bg-white hover:bg-slate-100 text-[11px] font-bold text-rose-600 border border-slate-200 rounded-lg shadow-2xs transition-all focus:outline-none"
                >
                  Clear File Selection
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FileSpreadsheet className="w-11 h-11 text-slate-400 mb-3" />
                <p className="text-xs font-bold text-slate-800">
                  Drag & Drop bank statement PDF/CSV here or <span className="text-blue-600 hover:underline">Click to Browse</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                  Supports .PDF credit cards, .CSV logs, Apple Card logs, Chase, or Bank of America statement sheets
                </p>
              </div>
            )}
          </label>

          <div className="p-3 bg-indigo-50/65 rounded-lg border border-indigo-100/50 flex gap-2.5">
            <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-900 leading-normal font-medium">
              <strong>Smart Multimodal Engine active:</strong> Gemini directly processes vector layouts and raw textual tables in PDF formats to identify dates, values, names, and precise allocations instantly.
            </div>
          </div>
        </div>

        {/* Column 2: Inspect Plaintext Content */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              2. Review Statement Content:
            </label>
            {statementText.trim() && (
              <button
                onClick={() => {
                  setStatementText("");
                  setSelectedFile(null);
                  setPdfAttachment(null);
                  setParsedCount(null);
                  setStagedTxs([]);
                  setErrorMsg(null);
                }}
                className="text-[10px] text-rose-600 hover:underline font-bold animate-pulse"
              >
                Clear text
              </button>
            )}
          </div>

          <textarea
            className="w-full min-h-[170px] flex-grow p-3 outline-none border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-xs bg-slate-50 text-slate-700 leading-relaxed shadow-inner"
            placeholder="Paste your CSV raw transaction rows, Apple Wallet exports, or text ledger data lines here..."
            value={statementText}
            id="statement-text-textarea"
            onChange={(e) => {
              setStatementText(e.target.value);
              setPdfAttachment(null); // clear attachment if manually editing text
            }}
          />

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={() => executeStatementAnalysis(statementText)}
              disabled={(!statementText.trim() && !pdfAttachment) || isParsing}
              id="analyze-statement-btn"
              className={`cursor-pointer py-2.5 px-5 rounded-lg font-bold text-xs border transition-all focus:outline-none flex items-center justify-center gap-2 w-full sm:w-auto ${
                isParsing || (!statementText.trim() && !pdfAttachment)
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-blue-600 text-white border-blue-500 hover:bg-blue-700 shadow-xs active:scale-98"
              }`}
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Decoding Statement Rows...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Feed Statement into SaveIt Advisor
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success / Error messaging banners */}
      {successImported && (
        <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 animate-fadeIn animate-duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-900">Success! Statement applied to your account.</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">All transaction rows were categorized and registered inside your active session history.</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-5 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs text-rose-900 font-medium leading-normal">
            <strong>Error processing text:</strong> {errorMsg}
          </div>
        </div>
      )}

      {/* STAGED LIST PREVIEW */}
      {stagedTxs.length > 0 && (
        <div className="mt-6 border border-blue-100 bg-blue-50/20 rounded-xl p-4.5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
                <FileText className="w-4 h-4 text-blue-600" /> Staging Area: Mapped Statement Rows
              </h4>
              <p className="text-[11px] text-blue-700 mt-1">
                Verify detected categories and amounts. Clear any items you do not want before importing.
              </p>
            </div>
            
            <button
              onClick={handleCommitUpload}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg inline-flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[3px]" /> Approve & Import ({stagedTxs.length} Transactions)
            </button>
          </div>

          {/* Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-3 bg-white/70 backdrop-blur-xs p-2.5 rounded-lg border border-blue-100/30 text-xs">
            <span className="text-[11px] font-extrabold text-blue-900/80 mr-1 uppercase tracking-wider">Sort List By:</span>
            
            <button
              onClick={() => setSortBy("category")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all focus:outline-none ${
                sortBy === "category"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              Category
            </button>

            <button
              onClick={() => setSortBy("date")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all focus:outline-none ${
                sortBy === "date"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              Date (Recent)
            </button>

            <button
              onClick={() => setSortBy("amount")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all focus:outline-none ${
                sortBy === "amount"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              Amount (Highest)
            </button>

            <button
              onClick={() => setSortBy("type")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all focus:outline-none ${
                sortBy === "type"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              Type (Income Focus)
            </button>
          </div>

          {/* Staged list table style preview list */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {getSortedStagedTxs().map((item, index) => (
              <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50 gap-4 transition-colors">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`p-1.5 rounded-md ${item.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                    {item.type === "income" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="font-sans font-semibold text-blue-600 px-1.5 py-0.2 bg-blue-50 rounded-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className={`text-xs font-extrabold ${item.type === "income" ? "text-emerald-600" : "text-slate-900"}`}>
                    {item.type === "income" ? "+" : "-"}{formatMoney(item.amount)}
                  </span>
                  
                  <button
                    onClick={() => handleRemoveStagedItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                    title="Omit row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
