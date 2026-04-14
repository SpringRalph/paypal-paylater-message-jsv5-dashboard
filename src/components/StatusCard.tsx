import { COUNTRY_LABELS } from "@/lib/countries";

export type CardStatus = "pending" | "success" | "error";

interface StatusCardProps {
  country: string;
  status: CardStatus;
  reason?: string;
}

export function StatusCard({ country, status, reason }: StatusCardProps) {
  return (
    <div className="bg-[#f5f5f5] rounded-lg p-4 text-center shadow-[0_2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23)] transition-all">
      <p className="font-medium text-[#616161] mb-2">{country}</p>
      <StatusIcon status={status} />
      {reason && (
        <p className="text-xs mt-2 text-[#616161]/60">{reason}</p>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: CardStatus }) {
  if (status === "pending") {
    return (
      <svg className="w-6 h-6 text-[#616161]/50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
      </svg>
    );
  }
  if (status === "success") {
    return (
      <svg className="w-6 h-6 text-[#388e3c] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-6 h-6 text-[#d32f2f] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
