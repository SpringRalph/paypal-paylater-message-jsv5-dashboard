import { NextRequest, NextResponse } from "next/server";
import { getPayPalBaseUrl } from "@/lib/paypal";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const buyerCountry = searchParams.get("buyer_country") ?? "US";
  const clientId = searchParams.get("client_id") ?? "";
  const environment = (searchParams.get("environment") ?? "live") as "sandbox" | "live";

  const baseUrl = getPayPalBaseUrl(environment);
  const targetUrl =
    `${baseUrl}/credit-presentment/smart/message?` +
    new URLSearchParams({
      buyer_country: buyerCountry,
      client_id: clientId,
      amount: "160",
      placement: "checkout",
      style_layout: "text",
      style_logo_type: "primary",
    });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);
    return NextResponse.json({ http_code: response.status }, { headers });
  } catch (err: unknown) {
    clearTimeout(timeout);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: isTimeout ? "timeout" : message },
      { headers }
    );
  }
}
