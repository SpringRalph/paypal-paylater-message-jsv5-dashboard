export interface EligibilityCheckResult {
    status: "success" | "error";
    reason: string;
    checked_at: string;
}

export async function checkEligibility(
    buyerCountry: string,
    clientId: string,
    environment: "sandbox" | "live" = "live"
): Promise<EligibilityCheckResult> {
    const params = new URLSearchParams({
        buyer_country: buyerCountry,
        client_id: clientId.trim(),
        environment: "live",
    });

    try {
        const res = await fetch(`/api/paylater-check?${params}`);
        const data = await res.json();
        const checked_at = new Date().toISOString();

        if (data.error === "timeout") {
            return { status: "error", reason: "Timeout", checked_at };
        } else if (data.http_code === 200) {
            return { status: "success", reason: "Eligible (HTTP 200)", checked_at };
        } else if (data.http_code === 403) {
            return { status: "error", reason: "Not authorized (HTTP 403)", checked_at };
        } else if (data.http_code) {
            return { status: "error", reason: `HTTP ${data.http_code}`, checked_at };
        } else {
            return { status: "error", reason: `Error: ${data.error}`, checked_at };
        }
    } catch {
        return {
            status: "error",
            reason: "Network error",
            checked_at: new Date().toISOString(),
        };
    }
}
