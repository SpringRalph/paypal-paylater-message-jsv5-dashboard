"use client";

import { useEffect, useRef } from "react";

interface LogEntry {
  timestamp: string;
  message: string;
}

interface LogPanelProps {
  logs: LogEntry[];
}

export function LogPanel({ logs }: LogPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-[#616161] mb-2">Test Logs</h3>
      <div
        ref={containerRef}
        className="bg-[#f5f5f5] rounded-md p-4 h-32 overflow-auto text-sm text-[#616161]/80 font-mono"
      >
        {logs.length === 0 ? (
          <span className="text-[#616161]/50">Ready.</span>
        ) : (
          logs.map((log, i) => (
            <div key={i}>[{log.timestamp}] {log.message}</div>
          ))
        )}
      </div>
    </div>
  );
}
