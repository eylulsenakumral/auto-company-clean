// Scenario Calculation and Comparison
// Product #16 | DHH | 2025-06-05

import { calculateFederalTax, getMarginalRate } from './federal-tax';
import { calculateCapitalGains, calculateLongTermSavings } from './capital-gains';
import { calculateAMT } from './amt';
import {
  TaxInput,
  Scenario,
  ComparisonResult,
  FullCalculation,
} from './types';

/**
 * Calculate single RSU sale scenario
 */
export function calculateScenario(input: TaxInput): FullCalculation {
  const { shares, vestPrice, sellPrice, otherIncome, filingStatus } ***REMOVED*** input;

  // Calculate proceeds and cost basis
  const proceeds ***REMOVED*** shares * sellPrice;
  const costBasis ***REMOVED*** shares * vestPrice;
  const gain ***REMOVED*** proceeds - costBasis;

  // RSU vesting is always ordinary income (taxed at vest)
  // At sale, we only pay capital gains on the difference
  const vestIncome ***REMOVED*** costBasis; // RSU value at vest (already taxed as ordinary income)
  const ordinaryIncomeAtVest ***REMOVED*** vestIncome;

  // Calculate capital gains tax on the sale
  // Default to short-term (holding period < 1 year)
  const holdingPeriodDays ***REMOVED*** 0; // Assume selling immediately
  const cgResult ***REMOVED*** calculateCapitalGains(
    proceeds,
    costBasis,
    otherIncome + ordinaryIncomeAtVest,
    filingStatus,
    holdingPeriodDays
  );

  // For RSUs: ordinary tax was already paid at vest
  // We only care about capital gains tax on the sale
  // Short-term gains are taxed at ordinary rates
  let ordinaryTax ***REMOVED*** 0;
  let capitalGainsTax ***REMOVED*** 0;

  if (holdingPeriodDays < 365) {
    // Short-term: taxed at ordinary income rates
    const totalOrdinaryIncome ***REMOVED*** otherIncome + ordinaryIncomeAtVest + cgResult.stcg;
    const fedTax ***REMOVED*** calculateFederalTax(totalOrdinaryIncome, filingStatus);
    const fedTaxNoSale ***REMOVED*** calculateFederalTax(otherIncome + ordinaryIncomeAtVest, filingStatus);
    ordinaryTax ***REMOVED*** fedTax.tax - fedTaxNoSale.tax; // Incremental tax from the sale
    capitalGainsTax ***REMOVED*** 0;
  } else {
    // Long-term: taxed at capital gains rates
    capitalGainsTax ***REMOVED*** cgResult.ltcgTax;
    ordinaryTax ***REMOVED*** 0;
  }

  const totalTax ***REMOVED*** ordinaryTax + capitalGainsTax;
  const netProceeds ***REMOVED*** proceeds - totalTax;
  const effectiveRate ***REMOVED*** proceeds > 0 ? totalTax / proceeds : 0;

  return {
    proceeds,
    ordinaryTax,
    capitalGainsTax,
    totalTax,
    netProceeds,
    effectiveRate,
    year: 2025,
    holdingPeriod: holdingPeriodDays >***REMOVED*** 365 ? 'LONG' : 'SHORT',
  };
}

/**
 * Calculate multiple sell-now vs sell-later scenarios
 */
export function calculateScenarios(
  baseInput: TaxInput
): ComparisonResult {
  const currentPrice ***REMOVED*** baseInput.sellPrice;

  // Generate scenario inputs with different sell prices
  const scenarioInputs: Array<{ name: string } & TaxInput> ***REMOVED*** [
    {
      name: 'Sell Now',
      shares: baseInput.shares,
      vestPrice: baseInput.vestPrice,
      sellPrice: currentPrice,
      otherIncome: baseInput.otherIncome,
      filingStatus: baseInput.filingStatus,
    },
    {
      name: 'Sell in 3 months',
      shares: baseInput.shares,
      vestPrice: baseInput.vestPrice,
      sellPrice: currentPrice * 1.05, // +5% projection
      otherIncome: baseInput.otherIncome,
      filingStatus: baseInput.filingStatus,
    },
    {
      name: 'Sell in 6 months',
      shares: baseInput.shares,
      vestPrice: baseInput.vestPrice,
      sellPrice: currentPrice * 1.10, // +10% projection
      otherIncome: baseInput.otherIncome,
      filingStatus: baseInput.filingStatus,
    },
    {
      name: 'Sell in 1 year',
      shares: baseInput.shares,
      vestPrice: baseInput.vestPrice,
      sellPrice: currentPrice * 1.10, // +10% projection
      otherIncome: baseInput.otherIncome,
      filingStatus: baseInput.filingStatus,
    },
  ];

  // Also add pessimistic scenarios
  const pessimisticInputs: Array<{ name: string } & TaxInput> ***REMOVED*** [
    {
      name: 'Sell Now (Pessimistic)',
      shares: baseInput.shares,
      vestPrice: baseInput.vestPrice,
      sellPrice: currentPrice * 0.95, // -5% projection
      otherIncome: baseInput.otherIncome,
      filingStatus: baseInput.filingStatus,
    },
  ];

  const allInputs ***REMOVED*** [...scenarioInputs, ...pessimisticInputs];

  // Calculate each scenario
  const comparison: Scenario[] ***REMOVED*** allInputs.map((input) ***REMOVED***> {
    const result ***REMOVED*** calculateScenario(input as TaxInput);
    return {
      name: input.name,
      proceeds: result.proceeds,
      ordinaryTax: result.ordinaryTax,
      capitalGainsTax: result.capitalGainsTax,
      totalTax: result.totalTax,
      netProceeds: result.netProceeds,
      effectiveRate: result.effectiveRate,
      holdingPeriod: result.holdingPeriod,
    };
  });

  // Find best scenario (highest net proceeds)
  const best ***REMOVED*** comparison.reduce((prev, current) ***REMOVED***>
    current.netProceeds > prev.netProceeds ? current : prev
  );

  const recommendation ***REMOVED*** `Best to ${best.name.toLowerCase()} for $${best.netProceeds.toFixed(2)} net proceeds`;

  return {
    comparison,
    recommendation,
  };
}

/**
 * Calculate optimal sell schedule for multiple vesting lots
 */
export function optimizeSellSchedule(lots: {
  vestDate: Date;
  vestPrice: number;
  shares: number;
}[]): {
  recommendations: string[];
  potentialSavings: number;
} {
  const recommendations: string[] ***REMOVED*** [];
  let totalPotentialSavings ***REMOVED*** 0;

  const currentDate ***REMOVED*** new Date();

  lots.forEach((lot) ***REMOVED***> {
    const vestDate ***REMOVED*** new Date(lot.vestDate);
    const daysSinceVest ***REMOVED*** Math.floor(
      (currentDate.getTime() - vestDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const daysUntilLongTerm ***REMOVED*** Math.max(0, 365 - daysSinceVest);

    if (daysSinceVest >***REMOVED*** 365) {
      recommendations.push(
        `Lot vested ${daysSinceVest} days ago: Already long-term. Sell anytime.`
      );
    } else if (daysUntilLongTerm <***REMOVED*** 90) {
      const estimatedSavings ***REMOVED*** lot.shares * lot.vestPrice * 0.1; // Rough estimate
      totalPotentialSavings +***REMOVED*** estimatedSavings;
      recommendations.push(
        `Lot vests in ${daysUntilLongTerm} days: Consider waiting ${daysUntilLongTerm} days for long-term treatment (potential savings: ~$${estimatedSavings.toFixed(2)}).`
      );
    } else {
      recommendations.push(
        `Lot vests in ${daysUntilLongTerm} days: Long-term treatment available in ${Math.floor(daysUntilLongTerm / 30)} months.`
      );
    }
  });

  return {
    recommendations,
    potentialSavings: totalPotentialSavings,
  };
}
