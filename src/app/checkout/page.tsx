"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CHECKOUT_COUNTRIES, COUNTRY_CURRENCY } from "@/lib/countries";
import { PAYPAL_CLIENT_ID_CHECKOUT } from "@/lib/paypal";
import Link from "next/link";
import { Tooltip } from "../eligibility/page";

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paypal: any;
        [key: string]: unknown;
    }
}

const SDK_SCRIPT_ID = "paypal-js-sdk";

type EligibilityMsg = { text: string; color: string };

export default function CheckoutPage() {
    const [buyerCountry, setBuyerCountry] = useState("US");
    const [eligibilityMsg, setEligibilityMsg] = useState<EligibilityMsg>({
        text: "正在检测 Pay Later 资格...",
        color: "#f39c12",
    });
    const [isPayLaterEligible, setIsPayLaterEligible] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<"cod" | "paylater">(
        "cod",
    );
    const [showExperience, setShowExperience] = useState(false);

    const currentNamespaceRef = useRef<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeButtonsRef = useRef<any>(null);

    const cleanupPayPalSDK = useCallback(() => {
        if (typeof activeButtonsRef.current?.close === "function") {
            try {
                activeButtonsRef.current.close();
            } catch {
                /* ignore */
            }
            activeButtonsRef.current = null;
        }

        document.getElementById(SDK_SCRIPT_ID)?.remove();

        const btn = document.getElementById("paypal-button-container");
        if (btn) btn.innerHTML = "";

        if (
            currentNamespaceRef.current &&
            window[currentNamespaceRef.current]
        ) {
            delete window[currentNamespaceRef.current];
        }
        delete window.paypal;
        delete window.paypalLoadScript;
        delete window.__paypal;
        delete window.__paypal_sdk__;
    }, []);

    /**
     * Renders the PayPal button first, then renders the message only after
     * the button has successfully mounted. This avoids message rendering into
     * a container that isn't ready yet, and ensures correct sequencing.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderPayLaterExperience = useCallback(
        (sdk: any, country: string) => {
            const currency = COUNTRY_CURRENCY[country] ?? "USD";

            activeButtonsRef.current = sdk.Buttons({
                fundingSource: sdk.FUNDING.PAYLATER,
                createOrder: (
                    _data: unknown,
                    actions: {
                        order: { create: (v: unknown) => Promise<string> };
                    },
                ) =>
                    actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    currency_code: currency,
                                    value: "160.00",
                                },
                            },
                        ],
                    }),
                onApprove: (
                    _data: unknown,
                    actions: {
                        order: {
                            capture: () => Promise<{
                                payer: { name: { given_name: string } };
                            }>;
                        };
                    },
                ) =>
                    actions.order.capture().then((details) => {
                        alert(
                            "模拟支付成功！感谢您, " +
                                details.payer.name.given_name,
                        );
                    }),
            });

            activeButtonsRef.current
                .render("#paypal-button-container")
                .then

                // () => {
                //   // Button is mounted — now safe to render the message
                //   sdk.Messages({
                //       amount: 160,
                //       placement: "checkout",
                //       buyerCountry: country,
                //       style: {
                //           layout: "text",
                //           logo: { position: "left" },
                //           text: { size: 14 },
                //       },
                //   }).render("#paypal-message-container");
                // }
                ()
                .catch(() => {
                    // Button render failed (e.g. funding not eligible in this context), skip message
                });
        },
        [],
    );

    const checkEligibility = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sdk: any, country: string) => {
            const eligible: boolean = sdk.isFundingEligible(
                sdk.FUNDING.PAYLATER,
            );
            setIsPayLaterEligible(eligible);

            if (eligible) {
                setEligibilityMsg({
                    text: "✅ 您的国家支持 PayPal Pay Later！",
                    color: "#27ae60",
                });
                renderPayLaterExperience(sdk, country);
            } else {
                setEligibilityMsg({
                    text: "❌ 当前选择的国家/地区不支持 PayPal Pay Later。",
                    color: "#e74c3c",
                });
                setSelectedPayment("cod");
                setShowExperience(false);
            }
        },
        [renderPayLaterExperience],
    );

    const loadPayPalSDK = useCallback(
        (country: string) => {
            setEligibilityMsg({
                text: "⏳ 正在检测 Pay Later 资格...",
                color: "#f39c12",
            });
            setIsPayLaterEligible(false);
            setShowExperience(false);
            setSelectedPayment("cod");
            cleanupPayPalSDK();

            const namespace = `paypal_${country.toLowerCase()}_${Date.now()}`;
            currentNamespaceRef.current = namespace;

            const currency = COUNTRY_CURRENCY[country] ?? "USD";
            const script = document.createElement("script");
            script.id = SDK_SCRIPT_ID;
            script.setAttribute("data-namespace", namespace);
            script.src =
                `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID_CHECKOUT}` +
                `&buyer-country=${country}&enable-funding=paylater&currency=${currency}` +
                `&components=funding-eligibility,buttons,messages`;

            script.onload = () => {
                if (namespace !== currentNamespaceRef.current) return;
                const sdk =
                    (window[namespace] as Window["paypal"]) || window.paypal;
                if (!sdk) {
                    setEligibilityMsg({
                        text: "❌ SDK 初始化失败，请稍后重试。",
                        color: "#e74c3c",
                    });
                    return;
                }
                checkEligibility(sdk, country);
            };

            script.onerror = () => {
                setEligibilityMsg({
                    text: "❌ SDK 加载失败，请检查网络或 Client ID。",
                    color: "#e74c3c",
                });
            };

            document.head.appendChild(script);
        },
        [cleanupPayPalSDK, checkEligibility],
    );

    useEffect(() => {
        loadPayPalSDK(buyerCountry);
        return () => {
            cleanupPayPalSDK();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleCountryChange(country: string) {
        setBuyerCountry(country);
        loadPayPalSDK(country);
    }

    function handlePaymentSelect(method: "cod" | "paylater") {
        if (method === "paylater" && !isPayLaterEligible) return;
        setSelectedPayment(method);
        setShowExperience(method === "paylater" && isPayLaterEligible);
    }

    function renderPayLaterMessage(country: string) {
        console.log("Now Rendering PayLater Message:");
        console.log("Buyer Country:", country);

        return (
            <>
                <Tooltip text="PayLater Message这里有一个本页面代码层面的bug, 在重选国家后无法及时重新渲染并显示对应国家的文本. 具体国家的真实文本参考下方区域" />
                <div
                    data-pp-message
                    data-pp-amount={160}
                    data-pp-buyercountry={country}
                />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fa] py-10 px-4">
            <div className="max-w-xl mx-auto">
                <Link
                    href="/"
                    className="text-sm text-[#6200ee] hover:underline mb-6 inline-block"
                >
                    ← Back
                </Link>

                <div className="bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-8">
                    <h1 className="text-2xl font-bold text-[#111] mb-6">
                        模拟结算页
                    </h1>

                    {/* Order Summary */}
                    <div className="bg-[#f9f9f9] border border-[#eee] rounded-lg p-4 mb-6">
                        <h2 className="text-lg font-bold text-[#111] mb-3">
                            订单摘要
                        </h2>
                        <div className="flex justify-between mb-2 text-[#333]">
                            <span>高级机械键盘</span>
                            <span>$150.00</span>
                        </div>
                        <div className="flex justify-between mb-2 text-[#333]">
                            <span>运费</span>
                            <span>$10.00</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t-2 border-[#ddd] pt-2 mt-2 text-[#111]">
                            <span>总计</span>
                            <span>$160.00</span>
                        </div>
                    </div>

                    {/* Country Selector */}
                    <div className="mb-6">
                        <label className="block mb-2 font-semibold text-[#333]">
                            请选择您的国家/地区 (Buyer Country):
                        </label>
                        <select
                            value={buyerCountry}
                            onChange={(e) =>
                                handleCountryChange(e.target.value)
                            }
                            className="w-full p-2.5 border border-[#ccc] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#6200ee]/30"
                        >
                            {CHECKOUT_COUNTRIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Methods */}
                    <h2 className="text-lg font-bold text-[#111] mb-3">
                        支付方式
                    </h2>
                    <div className="border border-[#e0e0e0] rounded-lg overflow-hidden">
                        {/* COD */}
                        <label
                            className="flex items-center p-4 border-b border-[#e0e0e0] cursor-pointer hover:bg-[#fdfdfd] transition-colors"
                            onClick={() => handlePaymentSelect("cod")}
                        >
                            <input
                                type="radio"
                                name="payment"
                                readOnly
                                checked={selectedPayment === "cod"}
                                className="mr-4 scale-125"
                            />
                            <div>
                                <div className="font-bold text-[#333]">
                                    Cash on Delivery (货到付款)
                                </div>
                                <div className="text-sm text-[#666]">
                                    收到商品时使用现金支付。
                                </div>
                            </div>
                        </label>

                        {/* Pay Later */}
                        <label
                            className={`flex items-center p-4 border-b border-[#e0e0e0] transition-colors ${
                                isPayLaterEligible
                                    ? "cursor-pointer hover:bg-[#fdfdfd]"
                                    : "opacity-50 cursor-not-allowed bg-[#fafafa]"
                            }`}
                            onClick={() => handlePaymentSelect("paylater")}
                        >
                            <input
                                type="radio"
                                name="payment"
                                readOnly
                                checked={selectedPayment === "paylater"}
                                disabled={!isPayLaterEligible}
                                className="mr-4 scale-125"
                            />
                            <div className="w-full">
                                <div className="font-bold text-[#333]">
                                    PayPal Pay Later (先买后付)
                                </div>
                                <div
                                    className="text-sm font-bold mt-1"
                                    style={{ color: eligibilityMsg.color }}
                                >
                                    {eligibilityMsg.text}
                                </div>
                            </div>
                        </label>

                        {/*
                         * Always in DOM — visibility via CSS only.
                         * Both containers must exist when SDK render() is called.
                         * Button renders first; message renders in the .then() callback.
                         */}
                        <div
                            className="flex-col gap-3 px-4 pb-5 pt-2"
                            style={{
                                display: showExperience ? "flex" : "none",
                            }}
                        >
                            {renderPayLaterMessage(buyerCountry)}
                            <div
                                id="paypal-button-container"
                                className="px-3 py-2 w-9/12"
                            />
                            {/* <div id="paypal-message-container"></div> */}
                        </div>
                    </div>
                </div>

                {/* All Countries PayLater Message Section */}
                <AllCountriesMessageSection />
            </div>
        </div>
    );
}

function AllCountriesMessageSection() {
    const supportedCountries = CHECKOUT_COUNTRIES.filter((c) => c.supported);

    useEffect(() => {
        if (document.getElementById("paypal-message-sdk")) return;

        const script = document.createElement("script");
        script.id = "paypal-message-sdk";
        script.setAttribute("data-namespace", "PayPalMessageSDK");
        script.src =
            "https://www.paypal.com/sdk/js?client-id=test&components=messages";

        script.onload = () => {
            // Script loaded, SDK will auto-render data-pp-message elements
        };

        document.head.appendChild(script);
    }, []);

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-[#111] mb-4">
                所有国家 PayLater Message 展示一览
            </h2>
            <div className="bg-white rounded-xl shadow-[0 4px_15px_rgba(0,0,0,0.05)] p-6">
                <p className="text-sm text-[#666] mb-4">
                    以下展示 8 个国家的 PayPal Pay Later
                    Message（固定展示，不随上方国家选择变化）：
                </p>
                <div className="grid grid-cols-2 gap-4">
                    {supportedCountries.map((country) => (
                        <div
                            key={country.value}
                            className="border border-[#e0e0e0] rounded-lg p-4"
                        >
                            <div className="text-sm font-semibold text-[#333] mb-2">
                                {country.label}
                            </div>
                            <div
                                data-pp-message
                                data-pp-placement="product"
                                data-pp-amount="160"
                                data-pp-buyercountry={country.value}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
