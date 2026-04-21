"use client";

import { useState, Fragment } from "react";
import { Combobox } from "@headlessui/react";
import { PAYPAL_CLIENT_ID_LIVE } from "@/lib/paypal";

// 预设的 Client ID 选项
const PRESET_CLIENT_IDS = [
  { id: "live-default", value: PAYPAL_CLIENT_ID_LIVE, label: "Live (Default)" },
  { id: "sandbox-test", value: "test", label: "Sandbox (test)" },
  // Custom 选项的 value 为空字符串，选择后会清空输入框让用户自行输入
  { id: "custom", value: "", label: "Your Client-Id here..." },
];

export function ClientIdCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  // Headless UI 的 Combobox.onChange 可能是 null，需要处理
  const handleChange = (newValue: string | null) => {
    onChange(newValue ?? "");
  };

  // 搜索过滤文本
  const [query, setQuery] = useState("");

  // 判断当前值是否为预设值之外的自定义值
  const isCustomValue =
    value !== "" &&
    !PRESET_CLIENT_IDS.some((p) => p.value === value);

  // 用于 Combobox 的 value始终是实际 Client ID 字符串
  const displayValue = value;

  // 根据搜索文本过滤下拉选项
  const filteredItems =
    query === ""
      ? PRESET_CLIENT_IDS
      : PRESET_CLIENT_IDS.filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.value.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Combobox value={displayValue} onChange={handleChange}>
      <div className="relative">
        <div className="relative">
          <Combobox.Input
            className="w-full px-4 py-2 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6200ee]/50 transition-all bg-white"
            displayValue={(v: string) => {
              // 自定义值：直接显示实际 Client ID
              if (isCustomValue) return v;
              // 预设值：显示 "标签 (实际ID)" 便于识别
              const preset = PRESET_CLIENT_IDS.find((p) => p.value === v);
              return preset ? `${preset.label} (${v})` : v;
            }}
            // 每次输入都同步到父组件，确保用户输入的自定义值能实时保存
            onChange={(e) => {
              setQuery(e.target.value);
              onChange(e.target.value);
            }}
            // 聚焦时，如果是自定义值，先把搜索框填满便于继续编辑
            onFocus={() => {
              if (isCustomValue) {
                setQuery(value);
              }
            }}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="w-4 h-4 text-[#616161]/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Combobox.Button>
        </div>

        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none border border-[#e0e0e0]">
          {filteredItems.length === 0 && query !== "" ? (
            <div className="relative cursor-default select-none px-4 py-2 text-[#616161]/50">
              No results found.
            </div>
          ) : (
            <Fragment>
              {/* 预设选项：Live Default 和 Sandbox */}
              {PRESET_CLIENT_IDS.filter(
                (item) =>
                  item.id === "live-default" || item.id === "sandbox-test"
              ).map((item) => (
                <Combobox.Option
                  key={item.id}
                  value={item.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active
                        ? "bg-[#6200ee]/10 text-[#6200ee]"
                        : "text-[#616161]"
                    }`
                  }
                >
                  {({ selected }) => (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span
                        className={`text-xs ${
                          selected ? "text-[#6200ee]" : "text-[#616161]/50"
                        }`}
                      >
                        {item.value}
                      </span>
                    </div>
                  )}
                </Combobox.Option>
              ))}

              {/* Custom 选项 - 选择后清空输入框，用户可自行输入任意值 */}
              <Combobox.Option
                key="custom"
                value=""
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active
                      ? "bg-[#6200ee]/10 text-[#6200ee]"
                      : "text-[#616161]"
                  }`
                }
              >
                {({ selected }) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Custom Client ID</span>
                    <span
                      className={`text-xs ${
                        selected ? "text-[#6200ee]" : "text-[#616161]/50"
                      }`}
                    >
                      Enter a custom value below
                    </span>
                  </div>
                )}
              </Combobox.Option>
            </Fragment>
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}
