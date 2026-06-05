// POST /api/calculate
// RSU Tax Calculator API
// Product #16 | DHH | 2025-06-05

import { NextRequest, NextResponse } from 'next/server';
import { calculateScenario, calculateScenarios } from '@/lib/tax-engine';

export async function POST(request: NextRequest) {
  try {
    const body ***REMOVED*** await request.json();

    // Validate input
    const {
      shares,
      vestPrice,
      sellPrice,
      otherIncome,
      filingStatus ***REMOVED*** 'SINGLE',
      compare ***REMOVED*** false,
    } ***REMOVED*** body;

    // Basic validation
    if (shares ***REMOVED******REMOVED******REMOVED*** undefined || vestPrice ***REMOVED******REMOVED******REMOVED*** undefined || sellPrice ***REMOVED******REMOVED******REMOVED*** undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: shares, vestPrice, sellPrice' },
        { status: 400 }
      );
    }

    if (shares < 0 || vestPrice < 0 || sellPrice < 0) {
      return NextResponse.json(
        { error: 'shares, vestPrice, and sellPrice must be non-negative' },
        { status: 400 }
      );
    }

    if (otherIncome !***REMOVED******REMOVED*** undefined && otherIncome < 0) {
      return NextResponse.json(
        { error: 'otherIncome must be non-negative' },
        { status: 400 }
      );
    }

    if (!['SINGLE', 'MFJ', 'HOH'].includes(filingStatus)) {
      return NextResponse.json(
        { error: 'filingStatus must be SINGLE, MFJ, or HOH' },
        { status: 400 }
      );
    }

    const input ***REMOVED*** {
      shares: Number(shares),
      vestPrice: Number(vestPrice),
      sellPrice: Number(sellPrice),
      otherIncome: otherIncome !***REMOVED******REMOVED*** undefined ? Number(otherIncome) : 0,
      filingStatus,
      compare,
    };

    if (compare) {
      const result ***REMOVED*** calculateScenarios(input);
      return NextResponse.json(result);
    } else {
      const result ***REMOVED*** calculateScenario(input);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
