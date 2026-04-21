"use client";

import { EligibilityResult, generateResultCSV } from "@/lib/csv-util";
import { PAYPAL_CLIENT_ID_CHECKOUT, PAYPAL_CLIENT_ID_LIVE } from "@/lib/paypal";
import { useCallback, useRef, useState } from "react";
import {parseEligibilityCSV} from "@/lib/csv-util"
import { COUNTRY_LIST } from "@/lib/countries";
import { checkEligibility } from "@/lib/eligibility";
import Link from "next/link";

type CheckStatus = "idle" | "running" | "done";

interface LogEntry {
    timestamp: string;
    message: string;
}

const TEMPLATE_CSV = `client_id\n${PAYPAL_CLIENT_ID_LIVE}`;

export default function BatchCheckPage() {
    const [status, setStatus] = useState<CheckStatus>("idle");
    const [results, setResults] = useState<EligibilityResult[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [parseError, setParseError] = useState<string | null>(null);
    const [clientIdCount, setClientIdCount] = useState(0);
    const fileRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<boolean>(false);

    const addLog = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev, { timestamp, message }]);
    }, []);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setParseError(null);
        setResults([]);
        setLogs([]);
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            try {
                const rows = parseEligibilityCSV(content);
                setClientIdCount(rows.length);
                addLog(
                    `Parsed ${rows.length} client ID(s) from "${file.name}". Will check ${rows.length * COUNTRY_LIST.length} combinations.`,
                );
            } catch (err: unknown) {
                setParseError(
                    err instanceof Error ? err.message : "Parse error",
                );
            }
        };
        reader.readAsText(file);
    }

    async function runBatch() {
        const file = fileRef.current?.files?.[0];
        if (!file) return;

        const content = await file.text();
        let rows;
        try {
            rows = parseEligibilityCSV(content);
        } catch (err: unknown) {
            setParseError(err instanceof Error ? err.message : "Parse error");
            return;
        }

        if (rows.length === 0) {
            addLog("No client IDs to process.");
            return;
        }

        const total = rows.length * COUNTRY_LIST.length;
        abortRef.current = false;
        setStatus("running");
        setResults([]);
        setLogs([]);
        addLog(
            `Starting batch check: ${rows.length} client ID(s) × ${COUNTRY_LIST.length} countries = ${total} checks...`,
        );

        const allResults: EligibilityResult[] = [];
        let done = 0;

        for (const { client_id } of rows) {
            if (abortRef.current) {
                addLog("Stopped by user.");
                break;
            }
            addLog(`--- Client ID: ${client_id.slice(0, 20)}... ---`);

            for (const country of COUNTRY_LIST) {
                if (abortRef.current) break;
                done++;
                const result = await checkEligibility(country, client_id);
                const fullResult: EligibilityResult = {
                    client_id,
                    buyer_country: country,
                    ...result,
                };
                allResults.push(fullResult);
                setResults([...allResults]);
                addLog(
                    `[${done}/${total}] ${country}: ${result.status === "success" ? "✓ Eligible" : "✗ Not eligible"} — ${result.reason}`,
                );
            }
        }

        const successCount = allResults.filter(
            (r) => r.status === "success",
        ).length;
        addLog(`Done. ${successCount}/${allResults.length} eligible.`);
        setStatus("done");
    }

    function stop() {
        abortRef.current = true;
    }

    function downloadCSV() {
        const csv = generateResultCSV(results);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `paylater-eligibility-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function downloadTemplate() {
        const blob = new Blob([TEMPLATE_CSV], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "batch-check-template.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Link
                href="/"
                className="text-sm text-[#6200ee] hover:underline mb-6 inline-block"
            >
                ← Back
            </Link>

            <div className="mb-8 text-center">
                <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-[#616161] mb-2">
                    Batch Eligibility Check
                </h1>
                <p className="text-[#616161]/70">
                    上传包含 Client ID 的 CSV，自动对所有 {COUNTRY_LIST.length}{" "}
                    个国家进行 Pay Later 资格检测（仅限正式环境）
                </p>
            </div>

            {/* Upload */}
            <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#616161]">
                        CSV 文件
                    </h2>
                    <button
                        onClick={downloadTemplate}
                        className="text-sm text-[#6200ee] hover:underline flex items-center gap-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        下载模板
                    </button>
                </div>

                <p className="text-sm text-[#616161]/60 mb-3">
                    CSV 只需一列：
                    <code className="bg-[#f5f5f5] px-1 rounded">client_id</code>
                    ，每个 Client ID 会自动检测全部 {COUNTRY_LIST.length}{" "}
                    个国家（{COUNTRY_LIST.join(", ")}）
                </p>

                <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    disabled={status === "running"}
                    className="block w-full text-sm text-[#616161] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#ede7f6] file:text-[#6200ee] hover:file:bg-[#d1c4e9] disabled:opacity-50 cursor-pointer"
                />

                {parseError && (
                    <p className="mt-2 text-sm text-red-600">{parseError}</p>
                )}

                {!parseError && clientIdCount > 0 && status === "idle" && (
                    <p className="mt-2 text-sm text-[#388e3c]">
                        {clientIdCount} 个 Client ID 已就绪 → 共{" "}
                        {clientIdCount * COUNTRY_LIST.length} 次检测
                    </p>
                )}

                <div className="mt-4 flex gap-3">
                    <button
                        onClick={runBatch}
                        disabled={
                            status === "running" ||
                            clientIdCount === 0 ||
                            !!parseError
                        }
                        className="bg-[#6200ee] text-white px-6 py-2.5 rounded-md shadow hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                        {status === "running" ? "检测中..." : "开始批量检测"}
                    </button>

                    {status === "running" && (
                        <button
                            onClick={stop}
                            className="border border-[#e0e0e0] text-[#616161] px-4 py-2.5 rounded-md hover:bg-[#f5f5f5] transition-all"
                        >
                            停止
                        </button>
                    )}

                    {results.length > 0 && (
                        <button
                            onClick={downloadCSV}
                            className="border border-[#6200ee] text-[#6200ee] px-4 py-2.5 rounded-md hover:bg-[#ede7f6] transition-all flex items-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            导出结果 CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Progress summary */}
            {results.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.12)] p-4 text-center">
                        <div className="text-2xl font-bold text-[#616161]">
                            {results.length}
                        </div>
                        <div className="text-sm text-[#616161]/60">已检测</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.12)] p-4 text-center">
                        <div className="text-2xl font-bold text-[#388e3c]">
                            {successCount}
                        </div>
                        <div className="text-sm text-[#616161]/60">
                            符合资格
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.12)] p-4 text-center">
                        <div className="text-2xl font-bold text-[#d32f2f]">
                            {errorCount}
                        </div>
                        <div className="text-sm text-[#616161]/60">不符合</div>
                    </div>
                </div>
            )}

            {/* Results table */}
            {results.length > 0 && (
                <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#f5f5f5]">
                                <tr>
                                    <th className="text-left px-4 py-3 text-[#616161] font-medium">
                                        Client ID
                                    </th>
                                    <th className="text-left px-4 py-3 text-[#616161] font-medium">
                                        国家
                                    </th>
                                    <th className="text-left px-4 py-3 text-[#616161] font-medium">
                                        状态
                                    </th>
                                    <th className="text-left px-4 py-3 text-[#616161] font-medium">
                                        原因
                                    </th>
                                    <th className="text-left px-4 py-3 text-[#616161] font-medium">
                                        检测时间
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <tr
                                        key={i}
                                        className="border-t border-[#f0f0f0] hover:bg-[#fafafa]"
                                    >
                                        <td className="px-4 py-3 text-[#616161]/60 font-mono text-xs">
                                            {r.client_id.slice(0, 20)}...
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[#616161]">
                                            {r.buyer_country}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    r.status === "success"
                                                        ? "bg-[#e8f5e9] text-[#388e3c]"
                                                        : "bg-[#ffebee] text-[#d32f2f]"
                                                }`}
                                            >
                                                {r.status === "success"
                                                    ? "✓ Eligible"
                                                    : "✗ Not eligible"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[#616161]/70">
                                            {r.reason}
                                        </td>
                                        <td className="px-4 py-3 text-[#616161]/50 text-xs">
                                            {new Date(
                                                r.checked_at,
                                            ).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Log */}
            {logs.length > 0 && (
                <div className="bg-[#1e1e2e] rounded-lg p-4">
                    <p className="text-[#a0a0b0] text-xs font-medium mb-2 uppercase tracking-wider">
                        Log
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {logs.map((l, i) => (
                            <div
                                key={i}
                                className="flex gap-2 text-xs font-mono"
                            >
                                <span className="text-[#6060a0] shrink-0">
                                    {l.timestamp}
                                </span>
                                <span className="text-[#c0c0d0]">
                                    {l.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
