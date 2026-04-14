export const COUNTRY_LIST = ["US", "GB", "DE", "FR", "IT", "ES", "AU", "CA"] as const;
export type CountryCode = (typeof COUNTRY_LIST)[number];

export const COUNTRY_LABELS: Record<string, string> = {
  US: "🇺🇸 United States",
  GB: "🇬🇧 United Kingdom",
  DE: "🇩🇪 Germany",
  FR: "🇫🇷 France",
  IT: "🇮🇹 Italy",
  ES: "🇪🇸 Spain",
  AU: "🇦🇺 Australia",
  CA: "🇨🇦 Canada",
};

export const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  AU: "AUD",
  CA: "CAD",
};

export const CHECKOUT_COUNTRIES: Array<{ value: string; label: string; supported: boolean }> = [
  { value: "US", label: "🇺🇸 美国 (United States) - USD", supported: true },
  { value: "GB", label: "🇬🇧 英国 (United Kingdom) - GBP", supported: true },
  { value: "DE", label: "🇩🇪 德国 (Germany) - EUR", supported: true },
  { value: "FR", label: "🇫🇷 法国 (France) - EUR", supported: true },
  { value: "IT", label: "🇮🇹 意大利 (Italy) - EUR", supported: true },
  { value: "ES", label: "🇪🇸 西班牙 (Spain) - EUR", supported: true },
  { value: "AU", label: "🇦🇺 澳大利亚 (Australia) - AUD", supported: true },
  { value: "CA", label: "🇨🇦 加拿大 (Canada) - CAD", supported: true },
  { value: "CN", label: "🇨🇳 中国 (China) - 不支持", supported: false },
  { value: "JP", label: "🇯🇵 日本 (Japan) - 不支持", supported: false },
];
