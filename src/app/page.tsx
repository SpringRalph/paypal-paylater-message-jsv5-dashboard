import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#616161] mb-3">
            PayPal Pay Later Tools
          </h1>
          <p className="text-[#616161]/70 text-lg">
            Developer tools for testing PayPal Pay Later integrations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/eligibility"
            className="group bg-white rounded-xl p-8 shadow-[0_2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23)] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#6200ee]/10 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-[#6200ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#212121] mb-2">
              Eligibility Check
            </h2>
            <p className="text-[#616161]/80 text-sm leading-relaxed">
              Batch-test Pay Later eligibility across 8 countries via API. Get instant HTTP status results without loading the PayPal SDK.
            </p>
            <div className="mt-6 text-[#6200ee] text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Open tool →
            </div>
          </Link>

          <Link
            href="/checkout"
            className="group bg-white rounded-xl p-8 shadow-[0_2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23)] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#6200ee]/10 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-[#6200ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#212121] mb-2">
              Checkout Demo
            </h2>
            <p className="text-[#616161]/80 text-sm leading-relaxed">
              Simulated checkout page with dynamic Pay Later availability. Switch buyer country to see real-time SDK eligibility and payment button rendering.
            </p>
            <div className="mt-6 text-[#6200ee] text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Open demo →
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
