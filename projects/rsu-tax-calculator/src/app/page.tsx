// RSU Tax Calculator - Client-Side Only Version
// Product #16 | DHH | 2025-06-05
// Static export compatible - no API routes needed

'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED*** TAX CONSTANTS (2025) ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

const FEDERAL_BRACKETS_2025 ***REMOVED*** [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: null, rate: 0.37 },
] as const;

const FEDERAL_BRACKETS_MFJ_2025 ***REMOVED*** [
  { min: 0, max: 23200, rate: 0.10 },
  { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 },
  { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 },
  { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: null, rate: 0.37 },
] as const;

const FEDERAL_BRACKETS_HOH_2025 ***REMOVED*** [
  { min: 0, max: 16550, rate: 0.10 },
  { min: 16550, max: 63100, rate: 0.12 },
  { min: 63100, max: 100500, rate: 0.22 },
  { min: 100500, max: 191950, rate: 0.24 },
  { min: 191950, max: 243700, rate: 0.32 },
  { min: 243700, max: 609350, rate: 0.35 },
  { min: 609350, max: null, rate: 0.37 },
] as const;

const STANDARD_DEDUCTION_2025 ***REMOVED*** {
  SINGLE: 14600,
  MFJ: 29200,
  HOH: 21800,
} as const;

const CAPITAL_GAINS_THRESHOLDS_2025 ***REMOVED*** {
  SINGLE: { ZERO: 47000, FIFTEEN: 518900 },
  MFJ: { ZERO: 94000, FIFTEEN: 1037800 },
  HOH: { ZERO: 63000, FIFTEEN: 551850 },
} as const;

// ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED*** TYPES ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

interface CalculationResult {
  proceeds: number;
  ordinaryTax: number;
  capitalGainsTax: number;
  totalTax: number;
  netProceeds: number;
  effectiveRate: number;
  year: number;
  holdingPeriod: 'SHORT' | 'LONG';
  brackets?: Array<{
    bracket: string;
    rate: number;
    taxableAmount: number;
    tax: number;
  }>;
}

interface ComparisonResult {
  comparison: Array<{
    name: string;
    proceeds: number;
    ordinaryTax: number;
    capitalGainsTax: number;
    totalTax: number;
    netProceeds: number;
    effectiveRate: number;
    holdingPeriod: 'SHORT' | 'LONG';
  }>;
  recommendation: string;
}

// ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED*** TAX CALCULATIONS ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

function getBrackets(filingStatus: 'SINGLE' | 'MFJ' | 'HOH') {
  return filingStatus ***REMOVED******REMOVED******REMOVED*** 'MFJ' ? FEDERAL_BRACKETS_MFJ_2025 :
         filingStatus ***REMOVED******REMOVED******REMOVED*** 'HOH' ? FEDERAL_BRACKETS_HOH_2025 :
         FEDERAL_BRACKETS_2025;
}

function getStandardDeduction(filingStatus: 'SINGLE' | 'MFJ' | 'HOH') {
  return filingStatus ***REMOVED******REMOVED******REMOVED*** 'MFJ' ? STANDARD_DEDUCTION_2025.MFJ :
         filingStatus ***REMOVED******REMOVED******REMOVED*** 'HOH' ? STANDARD_DEDUCTION_2025.HOH :
         STANDARD_DEDUCTION_2025.SINGLE;
}

function calculateFederalTax(taxableIncome: number, filingStatus: 'SINGLE' | 'MFJ' | 'HOH') {
  const brackets ***REMOVED*** getBrackets(filingStatus);
  const standardDeduction ***REMOVED*** getStandardDeduction(filingStatus);
  const finalTaxableIncome ***REMOVED*** Math.max(0, taxableIncome - standardDeduction);

  if (finalTaxableIncome ***REMOVED******REMOVED******REMOVED*** 0) {
    return { tax: 0, effectiveRate: 0, brackets: [] };
  }

  let totalTax ***REMOVED*** 0;
  let remainingIncome ***REMOVED*** finalTaxableIncome;
  const bracketTaxes: Array<{ bracket: string; rate: number; taxableAmount: number; tax: number }> ***REMOVED*** [];

  for (const bracket of brackets) {
    const bracketWidth ***REMOVED*** bracket.max ***REMOVED******REMOVED******REMOVED*** null ? Infinity : bracket.max - bracket.min;
    const taxableInBracket ***REMOVED*** Math.min(remainingIncome, bracketWidth);
    const taxInBracket ***REMOVED*** taxableInBracket * bracket.rate;

    if (taxableInBracket > 0) {
      bracketTaxes.push({
        bracket: `${(bracket.rate * 100).toFixed(0)}%`,
        rate: bracket.rate,
        taxableAmount: taxableInBracket,
        tax: taxInBracket,
      });
      totalTax +***REMOVED*** taxInBracket;
      remainingIncome -***REMOVED*** taxableInBracket;
    }

    if (remainingIncome <***REMOVED*** 0) break;
  }

  return {
    tax: totalTax,
    effectiveRate: taxableIncome > 0 ? totalTax / taxableIncome : 0,
    brackets: bracketTaxes,
  };
}

function calculateScenario(
  shares: number,
  vestPrice: number,
  sellPrice: number,
  otherIncome: number,
  filingStatus: 'SINGLE' | 'MFJ' | 'HOH',
  holdingPeriodDays: number ***REMOVED*** 0
): CalculationResult {
  const proceeds ***REMOVED*** shares * sellPrice;
  const costBasis ***REMOVED*** shares * vestPrice;
  const ordinaryIncomeAtVest ***REMOVED*** costBasis;

  const isLongTerm ***REMOVED*** holdingPeriodDays >***REMOVED*** 365;

  let ordinaryTax ***REMOVED*** 0;
  let capitalGainsTax ***REMOVED*** 0;

  if (isLongTerm) {
    // Long-term: capital gains at preferential rates
    const thresholds ***REMOVED*** CAPITAL_GAINS_THRESHOLDS_2025[filingStatus];
    const gain ***REMOVED*** proceeds - costBasis;

    if (gain > 0) {
      const taxableIncomeForLTCG ***REMOVED*** otherIncome + ordinaryIncomeAtVest;
      let rate ***REMOVED*** 0.20; // Default 20%

      if (taxableIncomeForLTCG <***REMOVED*** thresholds.ZERO) {
        rate ***REMOVED*** 0;
      } else if (taxableIncomeForLTCG <***REMOVED*** thresholds.FIFTEEN) {
        rate ***REMOVED*** 0.15;
      }

      capitalGainsTax ***REMOVED*** gain * rate;
    }
  } else {
    // Short-term: taxed at ordinary income rates
    const gain ***REMOVED*** proceeds - costBasis;
    const totalOrdinaryIncome ***REMOVED*** otherIncome + ordinaryIncomeAtVest + gain;
    const fedTax ***REMOVED*** calculateFederalTax(totalOrdinaryIncome, filingStatus);
    const fedTaxNoSale ***REMOVED*** calculateFederalTax(otherIncome + ordinaryIncomeAtVest, filingStatus);
    ordinaryTax ***REMOVED*** fedTax.tax - fedTaxNoSale.tax;
  }

  const totalTax ***REMOVED*** ordinaryTax + capitalGainsTax;
  const netProceeds ***REMOVED*** proceeds - totalTax;
  const effectiveRate ***REMOVED*** proceeds > 0 ? totalTax / proceeds : 0;

  // Get bracket details for display
  const fedTaxResult ***REMOVED*** calculateFederalTax(otherIncome + ordinaryIncomeAtVest + (isLongTerm ? 0 : proceeds - costBasis), filingStatus);

  return {
    proceeds,
    ordinaryTax,
    capitalGainsTax,
    totalTax,
    netProceeds,
    effectiveRate,
    year: 2025,
    holdingPeriod: isLongTerm ? 'LONG' : 'SHORT',
    brackets: fedTaxResult.brackets,
  };
}

function calculateScenarios(
  shares: number,
  vestPrice: number,
  sellPrice: number,
  otherIncome: number,
  filingStatus: 'SINGLE' | 'MFJ' | 'HOH'
): ComparisonResult {
  const scenarios ***REMOVED*** [
    { name: 'Sell Now', sellPrice, holdingPeriodDays: 0 },
    { name: 'Sell in 3 months', sellPrice: sellPrice * 1.05, holdingPeriodDays: 90 },
    { name: 'Sell in 6 months', sellPrice: sellPrice * 1.10, holdingPeriodDays: 180 },
    { name: 'Sell in 1 year', sellPrice: sellPrice * 1.10, holdingPeriodDays: 365 },
    { name: 'Sell Now (Pessimistic)', sellPrice: sellPrice * 0.95, holdingPeriodDays: 0 },
  ];

  const comparison ***REMOVED*** scenarios.map((scenario) ***REMOVED***> {
    const result ***REMOVED*** calculateScenario(
      shares,
      vestPrice,
      scenario.sellPrice,
      otherIncome,
      filingStatus,
      scenario.holdingPeriodDays
    );
    return {
      name: scenario.name,
      proceeds: result.proceeds,
      ordinaryTax: result.ordinaryTax,
      capitalGainsTax: result.capitalGainsTax,
      totalTax: result.totalTax,
      netProceeds: result.netProceeds,
      effectiveRate: result.effectiveRate,
      holdingPeriod: result.holdingPeriod,
    };
  });

  const best ***REMOVED*** comparison.reduce((prev, current) ***REMOVED***>
    current.netProceeds > prev.netProceeds ? current : prev
  );

  return {
    comparison,
    recommendation: `Best to ${best.name.toLowerCase()} for $${best.netProceeds.toFixed(2)} net proceeds`,
  };
}

// ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED*** MAIN COMPONENT ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

export default function Home() {
  const [shares, setShares] ***REMOVED*** useState('100');
  const [vestPrice, setVestPrice] ***REMOVED*** useState('50');
  const [sellPrice, setSellPrice] ***REMOVED*** useState('60');
  const [otherIncome, setOtherIncome] ***REMOVED*** useState('100000');
  const [filingStatus, setFilingStatus] ***REMOVED*** useState<'SINGLE' | 'MFJ' | 'HOH'>('SINGLE');
  const [loading, setLoading] ***REMOVED*** useState(false);
  const [result, setResult] ***REMOVED*** useState<CalculationResult | null>(null);
  const [comparison, setComparison] ***REMOVED*** useState<ComparisonResult | null>(null);

  const calculate ***REMOVED*** async (compare ***REMOVED*** false) ***REMOVED***> {
    setLoading(true);

    // Simulate calculation delay for UX
    await new Promise((resolve) ***REMOVED***> setTimeout(resolve, 300));

    try {
      if (compare) {
        const comparisonResult ***REMOVED*** calculateScenarios(
          Number(shares),
          Number(vestPrice),
          Number(sellPrice),
          Number(otherIncome),
          filingStatus
        );
        setComparison(comparisonResult);
        setResult(null);
      } else {
        const calcResult ***REMOVED*** calculateScenario(
          Number(shares),
          Number(vestPrice),
          Number(sellPrice),
          Number(otherIncome),
          filingStatus,
          0 // Default to short-term
        );
        setResult(calcResult);
        setComparison(null);
      }
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const bracketChartData ***REMOVED*** result?.brackets?.map((b) ***REMOVED***> ({
    bracket: b.bracket,
    tax: b.tax,
    taxable: b.taxableAmount,
  }));

  const comparisonChartData ***REMOVED*** comparison?.comparison.map((c) ***REMOVED***> ({
    name: c.name,
    'Net Proceeds': c.netProceeds,
    Tax: c.totalTax,
  }));

  return (
    <div className***REMOVED***"min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 print:bg-white">
      {/* Disclaimer Banner */}
      <div className***REMOVED***"bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 print:bg-white print:border-black">
        <div className***REMOVED***"max-w-7xl mx-auto px-4 py-3">
          <p className***REMOVED***"text-sm text-amber-800 dark:text-amber-300 text-center print:text-black">
            <strong>Disclaimer:</strong> This calculator is for educational purposes only and does not constitute tax, legal, or financial advice.
            Consult a qualified tax professional for your specific situation.
          </p>
        </div>
      </div>

      <div className***REMOVED***"max-w-7xl mx-auto px-4 py-8">
        <header className***REMOVED***"mb-8 text-center">
          <h1 className***REMOVED***"text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 print:text-black">
            RSU Tax Calculator
          </h1>
          <p className***REMOVED***"text-slate-600 dark:text-slate-400 print:text-black">
            Understand your tax liability on Restricted Stock Unit sales (2025 Tax Year)
          </p>
        </header>

        <div className***REMOVED***"grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className***REMOVED***"bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 print:bg-white print:shadow-none print:border print:border-black">
            <h2 className***REMOVED***"text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100 print:text-black">
              Enter Your Details
            </h2>

            <div className***REMOVED***"space-y-4">
              <div>
                <label className***REMOVED***"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 print:text-black">
                  Number of Shares
                </label>
                <input
                  type***REMOVED***"number"
                  value***REMOVED***{shares}
                  onChange***REMOVED***{(e) ***REMOVED***> setShares(e.target.value)}
                  className***REMOVED***"w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 print:border-black print:bg-white print:text-black"
                  placeholder***REMOVED***"100"
                />
              </div>

              <div>
                <label className***REMOVED***"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 print:text-black">
                  Vest Price per Share ($)
                </label>
                <input
                  type***REMOVED***"number"
                  value***REMOVED***{vestPrice}
                  onChange***REMOVED***{(e) ***REMOVED***> setVestPrice(e.target.value)}
                  className***REMOVED***"w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 print:border-black print:bg-white print:text-black"
                  placeholder***REMOVED***"50"
                />
              </div>

              <div>
                <label className***REMOVED***"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 print:text-black">
                  Current/Sell Price per Share ($)
                </label>
                <input
                  type***REMOVED***"number"
                  value***REMOVED***{sellPrice}
                  onChange***REMOVED***{(e) ***REMOVED***> setSellPrice(e.target.value)}
                  className***REMOVED***"w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 print:border-black print:bg-white print:text-black"
                  placeholder***REMOVED***"60"
                />
              </div>

              <div>
                <label className***REMOVED***"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 print:text-black">
                  Other Annual Income ($)
                </label>
                <input
                  type***REMOVED***"number"
                  value***REMOVED***{otherIncome}
                  onChange***REMOVED***{(e) ***REMOVED***> setOtherIncome(e.target.value)}
                  className***REMOVED***"w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 print:border-black print:bg-white print:text-black"
                  placeholder***REMOVED***"100000"
                />
              </div>

              <div>
                <label className***REMOVED***"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 print:text-black">
                  Filing Status
                </label>
                <select
                  value***REMOVED***{filingStatus}
                  onChange***REMOVED***{(e) ***REMOVED***> setFilingStatus(e.target.value as 'SINGLE' | 'MFJ' | 'HOH')}
                  className***REMOVED***"w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 print:border-black print:bg-white print:text-black"
                >
                  <option value***REMOVED***"SINGLE">Single</option>
                  <option value***REMOVED***"MFJ">Married Filing Jointly</option>
                  <option value***REMOVED***"HOH">Head of Household</option>
                </select>
              </div>

              <div className***REMOVED***"flex gap-3 pt-2">
                <button
                  onClick***REMOVED***{() ***REMOVED***> calculate(false)}
                  disabled***REMOVED***{loading}
                  className***REMOVED***"flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 print:bg-black print:text-white"
                >
                  {loading ? 'Calculating...' : 'Calculate Tax'}
                </button>
                <button
                  onClick***REMOVED***{() ***REMOVED***> calculate(true)}
                  disabled***REMOVED***{loading}
                  className***REMOVED***"flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 print:bg-black print:text-white"
                >
                  {loading ? 'Calculating...' : 'Compare Scenarios'}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className***REMOVED***"bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 print:bg-white print:shadow-none print:border print:border-black">
            <h2 className***REMOVED***"text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100 print:text-black">
              {comparison ? 'Scenario Comparison' : 'Tax Calculation'}
            </h2>

            {result && (
              <div className***REMOVED***"space-y-6">
                {/* Summary Cards */}
                <div className***REMOVED***"grid grid-cols-2 gap-4">
                  <div className***REMOVED***"bg-slate-50 dark:bg-slate-700 p-4 rounded-md print:bg-white print:border print:border-black">
                    <p className***REMOVED***"text-sm text-slate-600 dark:text-slate-400 print:text-black">Gross Proceeds</p>
                    <p className***REMOVED***"text-2xl font-bold text-slate-900 dark:text-slate-100 print:text-black">
                      ${result.proceeds.toFixed(2)}
                    </p>
                  </div>
                  <div className***REMOVED***"bg-green-50 dark:bg-green-900/20 p-4 rounded-md print:bg-white print:border print:border-black">
                    <p className***REMOVED***"text-sm text-green-600 dark:text-green-400 print:text-black">Net Proceeds</p>
                    <p className***REMOVED***"text-2xl font-bold text-green-700 dark:text-green-300 print:text-black">
                      ${result.netProceeds.toFixed(2)}
                    </p>
                  </div>
                  <div className***REMOVED***"bg-red-50 dark:bg-red-900/20 p-4 rounded-md print:bg-white print:border print:border-black">
                    <p className***REMOVED***"text-sm text-red-600 dark:text-red-400 print:text-black">Total Tax</p>
                    <p className***REMOVED***"text-2xl font-bold text-red-700 dark:text-red-300 print:text-black">
                      ${result.totalTax.toFixed(2)}
                    </p>
                  </div>
                  <div className***REMOVED***"bg-slate-50 dark:bg-slate-700 p-4 rounded-md print:bg-white print:border print:border-black">
                    <p className***REMOVED***"text-sm text-slate-600 dark:text-slate-400 print:text-black">Effective Rate</p>
                    <p className***REMOVED***"text-2xl font-bold text-slate-900 dark:text-slate-100 print:text-black">
                      {(result.effectiveRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Tax Breakdown */}
                <div className***REMOVED***"border-t border-slate-200 dark:border-slate-700 print:border-black pt-4">
                  <h3 className***REMOVED***"font-medium text-slate-900 dark:text-slate-100 print:text-black mb-2">Tax Breakdown</h3>
                  <div className***REMOVED***"space-y-2">
                    <div className***REMOVED***"flex justify-between">
                      <span className***REMOVED***"text-slate-600 dark:text-slate-400 print:text-black">Capital Gains Tax</span>
                      <span className***REMOVED***"font-medium text-slate-900 dark:text-slate-100 print:text-black">
                        ${result.capitalGainsTax.toFixed(2)}
                      </span>
                    </div>
                    <div className***REMOVED***"flex justify-between">
                      <span className***REMOVED***"text-slate-600 dark:text-slate-400 print:text-black">Ordinary Income Tax</span>
                      <span className***REMOVED***"font-medium text-slate-900 dark:text-slate-100 print:text-black">
                        ${result.ordinaryTax.toFixed(2)}
                      </span>
                    </div>
                    <div className***REMOVED***"flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 print:border-black">
                      <span className***REMOVED***"font-medium text-slate-900 dark:text-slate-100 print:text-black">Total</span>
                      <span className***REMOVED***"font-bold text-slate-900 dark:text-slate-100 print:text-black">
                        ${result.totalTax.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Holding Period */}
                <div className***REMOVED***{`p-4 rounded-md print:bg-white print:border print:border-black ${result.holdingPeriod ***REMOVED******REMOVED******REMOVED*** 'LONG' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                  <p className***REMOVED***{`font-medium ${result.holdingPeriod ***REMOVED******REMOVED******REMOVED*** 'LONG' ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'} print:text-black`}>
                    Holding Period: <span className***REMOVED***"font-bold">{result.holdingPeriod ***REMOVED******REMOVED******REMOVED*** 'LONG' ? 'LONG-TERM' : 'SHORT-TERM'}</span>
                  </p>
                  <p className***REMOVED***{`text-sm mt-1 ${result.holdingPeriod ***REMOVED******REMOVED******REMOVED*** 'LONG' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'} print:text-black`}>
                    {result.holdingPeriod ***REMOVED******REMOVED******REMOVED*** 'LONG'
                      ? 'Qualified for favorable long-term capital gains rates'
                      : 'Subject to short-term capital gains rates (same as ordinary income)'}
                  </p>
                </div>

                {/* Tax Bracket Visualization */}
                {result.brackets && result.brackets.length > 0 && (
                  <div className***REMOVED***"border-t border-slate-200 dark:border-slate-700 print:border-black pt-4">
                    <h3 className***REMOVED***"font-medium text-slate-900 dark:text-slate-100 print:text-black mb-4">Tax Bracket Breakdown</h3>
                    <ResponsiveContainer width***REMOVED***"100%" height***REMOVED***{250}>
                      <BarChart data***REMOVED***{bracketChartData} layout***REMOVED***"vertical">
                        <CartesianGrid strokeDasharray***REMOVED***"3 3" />
                        <XAxis type***REMOVED***"number" />
                        <YAxis dataKey***REMOVED***"bracket" type***REMOVED***"category" width***REMOVED***{60} />
                        <Tooltip
                          formatter***REMOVED***{(value: any) ***REMOVED***> typeof value ***REMOVED******REMOVED******REMOVED*** 'number' ? `$${value.toFixed(2)}` : String(value)}
                          contentStyle***REMOVED***{{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <Legend />
                        <Bar dataKey***REMOVED***"tax" fill***REMOVED***"#3b82f6" name***REMOVED***"Tax Amount" />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Bracket Table */}
                    <div className***REMOVED***"mt-4 overflow-x-auto">
                      <table className***REMOVED***"w-full text-sm">
                        <thead>
                          <tr className***REMOVED***"border-b border-slate-200 dark:border-slate-700 print:border-black">
                            <th className***REMOVED***"text-left py-2 text-slate-700 dark:text-slate-300 print:text-black">Bracket</th>
                            <th className***REMOVED***"text-right py-2 text-slate-700 dark:text-slate-300 print:text-black">Taxable Amount</th>
                            <th className***REMOVED***"text-right py-2 text-slate-700 dark:text-slate-300 print:text-black">Tax</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.brackets.map((bracket, idx) ***REMOVED***> (
                            <tr key***REMOVED***{idx} className***REMOVED***"border-b border-slate-100 dark:border-slate-800 print:border-black">
                              <td className***REMOVED***"py-2 text-slate-900 dark:text-slate-100 print:text-black">{bracket.bracket}</td>
                              <td className***REMOVED***"text-right text-slate-600 dark:text-slate-400 print:text-black">
                                ${bracket.taxableAmount.toFixed(2)}
                              </td>
                              <td className***REMOVED***"text-right font-medium text-slate-900 dark:text-slate-100 print:text-black">
                                ${bracket.tax.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {comparison && (
              <div className***REMOVED***"space-y-6">
                {/* Recommendation */}
                <div className***REMOVED***"bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md print:bg-white print:border print:border-black">
                  <p className***REMOVED***"font-medium text-blue-700 dark:text-blue-300 print:text-black">
                    {comparison.recommendation}
                  </p>
                </div>

                {/* Comparison Chart */}
                <div>
                  <ResponsiveContainer width***REMOVED***"100%" height***REMOVED***{300}>
                    <BarChart data***REMOVED***{comparisonChartData}>
                      <CartesianGrid strokeDasharray***REMOVED***"3 3" />
                      <XAxis dataKey***REMOVED***"name" />
                      <YAxis />
                      <Tooltip
                        formatter***REMOVED***{(value: any) ***REMOVED***> typeof value ***REMOVED******REMOVED******REMOVED*** 'number' ? `$${value.toFixed(2)}` : String(value)}
                        contentStyle***REMOVED***{{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                      <Legend />
                      <Bar dataKey***REMOVED***"Net Proceeds" fill***REMOVED***"#22c55e" />
                      <Bar dataKey***REMOVED***"Tax" fill***REMOVED***"#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Comparison Table */}
                <div className***REMOVED***"overflow-x-auto">
                  <table className***REMOVED***"w-full text-sm">
                    <thead>
                      <tr className***REMOVED***"border-b border-slate-200 dark:border-slate-700 print:border-black">
                        <th className***REMOVED***"text-left py-2 text-slate-700 dark:text-slate-300 print:text-black">Scenario</th>
                        <th className***REMOVED***"text-right py-2 text-slate-700 dark:text-slate-300 print:text-black">Proceeds</th>
                        <th className***REMOVED***"text-right py-2 text-slate-700 dark:text-slate-300 print:text-black">Tax</th>
                        <th className***REMOVED***"text-right py-2 text-slate-700 dark:text-slate-300 print:text-black">Net</th>
                        <th className***REMOVED***"text-right py-2 text-slate-700 dark:text-slate-300 print:text-black">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.comparison.map((scenario, idx) ***REMOVED***> (
                        <tr key***REMOVED***{idx} className***REMOVED***"border-b border-slate-100 dark:border-slate-800 print:border-black">
                          <td className***REMOVED***"py-2 text-slate-900 dark:text-slate-100 print:text-black">{scenario.name}</td>
                          <td className***REMOVED***"text-right text-slate-600 dark:text-slate-400 print:text-black">
                            ${scenario.proceeds.toFixed(2)}
                          </td>
                          <td className***REMOVED***"text-right text-red-600 dark:text-red-400 print:text-black">
                            ${scenario.totalTax.toFixed(2)}
                          </td>
                          <td className***REMOVED***"text-right font-medium text-green-600 dark:text-green-400 print:text-black">
                            ${scenario.netProceeds.toFixed(2)}
                          </td>
                          <td className***REMOVED***"text-right text-slate-600 dark:text-slate-400 print:text-black">
                            {(scenario.effectiveRate * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Optimal Sell Schedule */}
                <div className***REMOVED***"border-t border-slate-200 dark:border-slate-700 print:border-black pt-4">
                  <h3 className***REMOVED***"font-medium text-slate-900 dark:text-slate-100 print:text-black mb-3">Optimal Sell Schedule</h3>
                  <div className***REMOVED***"bg-green-50 dark:bg-green-900/20 p-4 rounded-md print:bg-white print:border print:border-black">
                    <p className***REMOVED***"text-sm text-green-700 dark:text-green-300 print:text-black">
                      <strong>Recommendation:</strong> Consider waiting 1 year from vest date to qualify for long-term
                      capital gains treatment, which could reduce your tax rate from ordinary income rates (up to 37%) to
                      preferential long-term rates (0%, 15%, or 20%).
                    </p>
                    <p className***REMOVED***"text-sm text-green-600 dark:text-green-400 mt-2 print:text-black">
                      For {shares} shares at ${vestPrice} vest price, selling at ${sellPrice} could save approximately
                      ${((Number(sellPrice) - Number(vestPrice)) * Number(shares) * 0.15).toFixed(2)} in taxes if held
                      long-term (assuming 15% LTCG rate vs. ordinary income rate).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!result && !comparison && (
              <div className***REMOVED***"text-center py-12 text-slate-500 dark:text-slate-400 print:text-black">
                <p>Enter your details and click Calculate to see your tax breakdown</p>
              </div>
            )}
          </div>
        </div>

        {/* Export & Print Section */}
        {(result || comparison) && (
          <div className***REMOVED***"mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 print:bg-white print:shadow-none print:border print:border-black">
            <h2 className***REMOVED***"text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100 print:text-black">
              Export & Print
            </h2>
            <div className***REMOVED***"flex flex-wrap gap-4">
              <button
                onClick***REMOVED***{() ***REMOVED***> window.print()}
                className***REMOVED***"bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-6 rounded-md transition-colors print:bg-black print:text-white print:border print:border-black"
              >
                Print / Save as PDF
              </button>
              <div className***REMOVED***"flex-1 flex items-center justify-end print:hidden">
                <span className***REMOVED***"text-sm text-slate-600 dark:text-slate-400 mr-2">
                  Need professional export for your tax preparer?
                </span>
                <button className***REMOVED***"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Get Premium Export - $9
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className***REMOVED***"mt-12 text-center text-sm text-slate-500 dark:text-slate-400 print:text-black">
          <p className***REMOVED***"mb-2">
            Built with 2025 IRS tax brackets. Updated annually for tax law changes.
          </p>
          <p>
            Open source on GitHub —{' '}
            <a
              href***REMOVED***"https://github.com/eylulsenakumral/rsu-tax-calculator"
              target***REMOVED***"_blank"
              rel***REMOVED***"noopener noreferrer"
              className***REMOVED***"text-blue-600 hover:text-blue-700 print:text-black"
            >
              View Source Code
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
