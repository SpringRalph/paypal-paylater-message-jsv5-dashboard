"use client";

import { useState, useCallback } from "react";
import { StatusCard, CardStatus } from "@/components/StatusCard";
import { LogPanel } from "@/components/LogPanel";
import { COUNTRY_LIST, COUNTRY_LABELS } from "@/lib/countries";
import { PAYPAL_CLIENT_ID_LIVE } from "@/lib/paypal";
import { ClientIdCombobox } from "@/components/ClientIdCombobox";
import Link from "next/link";

type Environment = "sandbox" | "live";

interface CountryResult {
  country: string;
  status: CardStatus;
  reason: string;
}

interface LogEntry {
  timestamp: string;
  message: string;
}

const CURRENCIES = ["USD", "GBP", "EUR", "AUD", "CAD"];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "it", label: "Italian" },
  { value: "es", label: "Spanish" },
];

export default function EligibilityPage() {
  const [clientId, setClientId] = useState(PAYPAL_CLIENT_ID_LIVE);
  const [siteCountry, setSiteCountry] = useState("US");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");
  const [environment, setEnvironment] = useState<Environment>("live");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<CountryResult[]>(
    COUNTRY_LIST.map((c) => ({ country: c, status: "pending", reason: "" }))
  );

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message }]);
  }, []);

  async function checkCountry(country: string): Promise<CountryResult> {
    const params = new URLSearchParams({
      buyer_country: country,
      client_id: clientId.trim() || (environment === "sandbox" ? "test" : ""),
      environment,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(`/api/paylater-check?${params}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();

      if (data.error === "timeout") {
        return { country, status: "error", reason: "Timeout" };
      } else if (data.http_code === 200) {
        return { country, status: "success", reason: "Eligible (HTTP 200)" };
      } else if (data.http_code === 403) {
        return { country, status: "error", reason: "Not authorized (HTTP 403)" };
      } else if (data.http_code) {
        return { country, status: "error", reason: `HTTP ${data.http_code}` };
      } else {
        return { country, status: "error", reason: `Error: ${data.error}` };
      }
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        return { country, status: "error", reason: "Timeout (no response)" };
      }
      return { country, status: "error", reason: `Network error` };
    }
  }

  async function runTests() {
    if (environment === "live" && !clientId.trim()) {
      addLog("Live environment requires a valid Client ID.");
      return;
    }

    setLoading(true);
    setLogs([]);
    setResults(COUNTRY_LIST.map((c) => ({ country: c, status: "pending", reason: "" })));
    addLog("Starting API eligibility checks...");

    const settled = await Promise.all(
      COUNTRY_LIST.map(async (country) => {
        const result = await checkCountry(country);
        setResults((prev) =>
          prev.map((r) => (r.country === country ? result : r))
        );
        addLog(`${country}: ${result.status === "success" ? "SUCCESS" : "FAILED"} - ${result.reason}`);
        return result;
      })
    );

    addLog(`All checks completed! ${settled.filter((r) => r.status === "success").length}/${COUNTRY_LIST.length} eligible.`);
    setLoading(false);
  }

  function handleEnvironmentChange(env: Environment) {
    setEnvironment(env);
    if (env === "live") {
      setClientId(PAYPAL_CLIENT_ID_LIVE);
    } else {
      setClientId("test");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Back */}
      <Link href="/" className="text-sm text-[#6200ee] hover:underline mb-6 inline-block">
        ← Back
      </Link>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-[#616161] mb-2">
          PayPal Pay Later Eligibility Tester
        </h1>
        <p className="text-[#616161]/70">
          直接通过 API 请求检测各国家的 Pay Later Message 资格，无需加载 SDK
        </p>
      </div>

      {/* Config */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Client ID */}
          <div className="col-span-1 md:col-span-3">
            <label className="block text-[#616161] font-medium mb-2">PayPal Client ID</label>
            <ClientIdCombobox value={clientId} onChange={setClientId} />
          </div>

          {/* Site Country */}
          <div>
            <label className="flex items-center gap-1 text-[#616161] font-medium mb-2">
              Site Country
              <Tooltip text="需要确认站点所展示的货币和语言与展示message的国家是一致的，PayPal PayLater Message本身并不依赖Currency与Language进行校验" />
            </label>
            <select
              value={siteCountry}
              onChange={(e) => setSiteCountry(e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6200ee]/50 transition-all bg-white"
            >
              {COUNTRY_LIST.map((c) => (
                <option key={c} value={c}>{c} - {COUNTRY_LABELS[c]?.replace(/^.+?\s/, "")}</option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="flex items-center gap-1 text-[#616161] font-medium mb-2">
              Currency
              <Tooltip text="需要确认站点所展示的货币和语言与展示message的国家是一致的，PayPal PayLater Message本身并不依赖Currency与Language进行校验" />
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6200ee]/50 transition-all bg-white"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="flex items-center gap-1 text-[#616161] font-medium mb-2">
              Language
              <Tooltip text="需要确认站点所展示的货币和语言与展示message的国家是一致的，PayPal PayLater Message本身并不依赖Currency与Language进行校验" />
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6200ee]/50 transition-all bg-white"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Environment */}
          <div>
            <label className="block text-[#616161] font-medium mb-2">PayPal Environment</label>
            <select
              value={environment}
              onChange={(e) => handleEnvironmentChange(e.target.value as Environment)}
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6200ee]/50 transition-all bg-white"
            >
              <option value="sandbox">Sandbox (Test)</option>
              <option value="live">Live (Production)</option>
            </select>
          </div>
        </div>

        <button
          onClick={runTests}
          disabled={loading}
          className="bg-[#6200ee] text-white px-6 py-3 rounded-md shadow-[0_2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23)] transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {loading ? "Checking..." : "Run Eligibility Check (API)"}
        </button>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] p-6 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/70 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-[#6200ee] border-t-transparent rounded-full mb-2" />
              <p className="text-[#616161] font-medium">Checking eligibility via API...</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#616161]">Eligibility Status</h2>
          <button
            onClick={runTests}
            disabled={loading}
            className="p-2 rounded-full hover:bg-[#f5f5f5] transition-all text-[#616161] disabled:opacity-50"
            title="Refresh Results"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((r) => (
            <StatusCard
              key={r.country}
              country={r.country}
              status={r.status}
              reason={r.reason}
            />
          ))}
        </div>

        <LogPanel logs={logs} />
      </div>
    </div>
  );
}

export function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex">
      <svg className="w-4 h-4 text-[#616161]/40 cursor-default" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#424242] text-white text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
        {text}
      </span>
    </span>
  );
}
