
import React from 'react';
import NumberFlow from "@number-flow/react";

interface PriceDisplayProps {
  currentPrice: number;
  period: string;
  isMonthly: boolean;
  isFree: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  currentPrice,
  period,
  isMonthly,
  isFree
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-center gap-x-2 mb-2">
        <span className="text-5xl font-bold tracking-tight text-gray-900">
          <NumberFlow
            value={currentPrice}
            format={{
              style: "currency",
              currency: "AUD",
              minimumFractionDigits: isFree ? 0 : 2,
              maximumFractionDigits: isFree ? 0 : 2,
            }}
            transformTiming={{
              duration: 500,
              easing: "ease-out",
            }}
            willChange
            className="font-variant-numeric: tabular-nums"
          />
        </span>
        {period !== "forever" && (
          <span className="text-lg font-medium text-gray-500">
            / {period}
          </span>
        )}
      </div>

      <div className="text-sm text-gray-500">
        {period === "forever" ? (
          "No credit card required"
        ) : (
          <>
            {isMonthly ? "Billed monthly" : `Billed annually (A$${isMonthly ? currentPrice : (currentPrice * 12).toFixed(2)}/year)`}
            {!isMonthly && (
              <div className="text-mint-600 font-medium mt-1">
                Save 20% with annual billing
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
