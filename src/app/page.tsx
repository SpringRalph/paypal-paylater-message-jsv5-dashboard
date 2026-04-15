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

        <div className="mt-10 text-center">
          <a
            href="https://github.com/SpringRalph/paypal-paylater-message-jsv5-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#616161]/60 hover:text-[#6200ee] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
