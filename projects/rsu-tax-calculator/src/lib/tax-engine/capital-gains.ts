// Capital Gains Tax Calculation
// Product #16 | DHH | 2025-06-05

import {
  CAPITAL_GAINS_THRESHOLDS_2025,
  LTCG_RATES,
  CapitalGainsResult,
} from './types';

/**
 * Calculate capital gains tax for RSU sales
 * RSUs always have cost basis ***REMOVED*** vest price (ordinary income already taxed at vest)
 */
export function calculateCapitalGains(
  proceeds: number,
  costBasis: number,
  otherIncome: number,
  filingStatus: 'SINGLE' | 'MFJ' | 'HOH' ***REMOVED*** 'SINGLE',
  holdingPeriodDays: number ***REMOVED*** 0
): CapitalGainsResult {
  const gain ***REMOVED*** proceeds - costBasis;

  if (gain <***REMOVED*** 0) {
    return {
      stcg: 0,
      stcgTax: 0,
      ltcg: 0,
      ltcgTax: 0,
      totalTax: 0,
    };
  }

  // Determine if short-term or long-term
  const isLongTerm ***REMOVED*** holdingPeriodDays >***REMOVED*** 365;

  const thresholds ***REMOVED*** CAPITAL_GAINS_THRESHOLDS_2025[filingStatus];

  if (isLongTerm) {
    // Long-term capital gains: 0%, 15%, or 20%
    const taxableIncomeForLTCG ***REMOVED*** otherIncome;

    let rate ***REMOVED*** LTCG_RATES.TWENTY; // Default 20%

    if (taxableIncomeForLTCG <***REMOVED*** thresholds.ZERO) {
      rate ***REMOVED*** LTCG_RATES.ZERO;
    } else if (taxableIncomeForLTCG <***REMOVED*** thresholds.FIFTEEN) {
      rate ***REMOVED*** LTCG_RATES.FIFTEEN;
    }

    const ltcgTax ***REMOVED*** gain * rate;

    return {
      stcg: 0,
      stcgTax: 0,
      ltcg: gain,
      ltcgTax,
      totalTax: ltcgTax,
    };
  } else {
    // Short-term capital gains: taxed at ordinary income rates
    // We'll calculate this in the federal tax module
    return {
      stcg: gain,
      stcgTax: 0, // Will be calculated as ordinary income
      ltcg: 0,
      ltcgTax: 0,
      totalTax: 0,
    };
  }
}

/**
 * Calculate potential tax savings from waiting for long-term treatment
 */
export function calculateLongTermSavings(
  gain: number,
  currentOrdinaryRate: number,
  otherIncome: number,
  filingStatus: 'SINGLE' | 'MFJ' | 'HOH' ***REMOVED*** 'SINGLE'
): {
  shortTermTax: number;
  longTermTax: number;
  savings: number;
  savingsRate: number;
} {
  const thresholds ***REMOVED*** CAPITAL_GAINS_THRESHOLDS_2025[filingStatus];

  // Short-term tax (at ordinary rate)
  const shortTermTax ***REMOVED*** gain * currentOrdinaryRate;

  // Long-term tax
  let ltcgRate ***REMOVED*** LTCG_RATES.TWENTY;
  if (otherIncome <***REMOVED*** thresholds.ZERO) {
    ltcgRate ***REMOVED*** LTCG_RATES.ZERO;
  } else if (otherIncome <***REMOVED*** thresholds.FIFTEEN) {
    ltcgRate ***REMOVED*** LTCG_RATES.FIFTEEN;
  }

  const longTermTax ***REMOVED*** gain * ltcgRate;
  const savings ***REMOVED*** shortTermTax - longTermTax;
  const savingsRate ***REMOVED*** shortTermTax > 0 ? savings / shortTermTax : 0;

  return {
    shortTermTax,
    longTermTax,
    savings,
    savingsRate,
  };
}
