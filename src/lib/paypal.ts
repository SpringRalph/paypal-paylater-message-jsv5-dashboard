export const PAYPAL_CLIENT_ID_LIVE =
  "AWs8RlbWkvuJ1wctcg1XxhNpIOgAWfD5hXNPPpVvY0tCj_cm_dNwVrsPLkEqNxo99tLR2pLA0dgpABtO";

export const PAYPAL_CLIENT_ID_CHECKOUT =
  "AaB-X2CM2jf9k-DU-sWSaNbpfKnHeRLHa84MppXHdBpv36uWUqGui9ldOk6SeET9Os5Hc4J5puUTetXo";

export function getPayPalBaseUrl(env: "sandbox" | "live"): string {
  return env === "sandbox"
    ? "https://www.sandbox.paypal.com"
    : "https://www.paypal.com";
}
