// Federal Tax Calculation
// Product #16 | DHH | 2025-06-05

import {
  FEDERAL_BRACKETS_2025,
  FEDERAL_BRACKETS_MFJ_2025,
  FEDERAL_BRACKETS_HOH_2025,
  STANDARD_DEDUCTION_2025,
  FederalTaxResult,
  BracketTax,
} from './types';

/**
 * Calculate federal income tax using progressive brackets
 * Uses exclusive upper bound semantics: max value is NOT included in bracket
 */
export function calculateFederalTax(
  taxableIncome: number,
  filingStatus: 'SINGLE' | 'MFJ' | 'HOH' ***REMOVED*** 'SINGLE'
): FederalTaxResult {
  // Get brackets based on filing status
  const brackets ***REMOVED***
    filingStatus ***REMOVED******REMOVED******REMOVED*** 'MFJ'
      ? FEDERAL_BRACKETS_MFJ_2025
      : filingStatus ***REMOVED******REMOVED******REMOVED*** 'HOH'
      ? FEDERAL_BRACKETS_HOH_2025
      : FEDERAL_BRACKETS_2025;

  const standardDeduction ***REMOVED***
    filingStatus ***REMOVED******REMOVED******REMOVED*** 'MFJ'
      ? STANDARD_DEDUCTION_2025.MFJ
      : filingStatus ***REMOVED******REMOVED******REMOVED*** 'HOH'
      ? STANDARD_DEDUCTION_2025.HOH
      : STANDARD_DEDUCTION_2025.SINGLE;

  // Calculate taxable income after standard deduction
  const finalTaxableIncome ***REMOVED*** Math.max(0, taxableIncome - standardDeduction);

  if (finalTaxableIncome ***REMOVED******REMOVED******REMOVED*** 0) {
    return {
      tax: 0,
      effectiveRate: 0,
      brackets: [],
    };
  }

  let totalTax ***REMOVED*** 0;
  let remainingIncome ***REMOVED*** finalTaxableIncome;
  const bracketTaxes: BracketTax[] ***REMOVED*** [];

  for (const bracket of brackets) {
    const bracketWidth ***REMOVED***
      bracket.max ***REMOVED******REMOVED******REMOVED*** null ? Infinity : bracket.max - bracket.min;
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

/**
 * Get marginal tax rate for a given income level
 */
export function getMarginalRate(
  taxableIncome: number,
  filingStatus: 'SINGLE' | 'MFJ' | 'HOH' ***REMOVED*** 'SINGLE'
): number {
  const brackets ***REMOVED***
    filingStatus ***REMOVED******REMOVED******REMOVED*** 'MFJ'
      ? FEDERAL_BRACKETS_MFJ_2025
      : filingStatus ***REMOVED******REMOVED******REMOVED*** 'HOH'
      ? FEDERAL_BRACKETS_HOH_2025
      : FEDERAL_BRACKETS_2025;

  const standardDeduction ***REMOVED***
    filingStatus ***REMOVED******REMOVED******REMOVED*** 'MFJ'
      ? STANDARD_DEDUCTION_2025.MFJ
      : filingStatus ***REMOVED******REMOVED******REMOVED*** 'HOH'
      ? STANDARD_DEDUCTION_2025.HOH
      : STANDARD_DEDUCTION_2025.SINGLE;

  const finalTaxableIncome ***REMOVED*** Math.max(0, taxableIncome - standardDeduction);

  for (const bracket of brackets) {
    if (
      finalTaxableIncome >***REMOVED*** bracket.min &&
      (bracket.max ***REMOVED******REMOVED******REMOVED*** null || finalTaxableIncome < bracket.max)
    ) {
      return bracket.rate;
    }
  }

  return brackets[brackets.length - 1].rate;
}
