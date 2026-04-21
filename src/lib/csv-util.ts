import { ClientIdCombobox } from '@/components/ClientIdCombobox';
export interface EligibilityInput {
    client_id: string;
}

export interface EligibilityResult {
    client_id: string;
    buyer_country: string;
    status: "success" | "error";
    reason: string;
    checked_at: string
}

export const parseEligibilityCSV = (content: string): EligibilityInput[] => {

    //"A \n B\n\nC" => ["A ", " B", "" ,"C"]  => ["A", "B", "" ,"C"] => ["A", "B", "C"]
    const lines = content.split("\n").map((value) => value.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map((val) => val.trim().toLowerCase());

    const clientIdLine = headers.indexOf("client_id")

    return lines.slice(1).map((line) => {
        const cols = line.split(",").map(val => val.trim());
        return { client_id: cols[clientIdLine] ?? "" };
    })
}

/**
 * 转义 CSV 字段中的特殊字符。
 * - 包含逗号、双引号或换行时，用双引号包裹。
 * - 字段内部的双引号替换成两个双引号（CSV RFC 4180 规定）。
 * @param value 原始字段值
 * @returns 转义后的字段值
 * @example
 * escapeCSVField("Hello")           // "Hello"
 * escapeCSVField("Hello, World")   // "\"Hello, World\""
 * escapeCSVField("He said \"Hi\"")  // "\"He said \"\"Hi\"\"\""
 * escapeCSVField("Line1\nLine2")   // "\"Line1\nLine2\""
 */
function escapeCSVField(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export function generateResultCSV(rows: EligibilityResult[]): string {
    const header = "client_id,buyer_country,status,reason,checked_at";
    if (rows.length === 0) return header;

    const dataLines = rows.map((r) =>
        [r.client_id, r.buyer_country, r.status, r.reason, r.checked_at]
            .map(escapeCSVField)
            .join(",")
    );
    return [header, ...dataLines].join("\n");
}