export interface ChitScheduleRow {
  month: number;
  date: string;
  monthlyPaymentLabel: string;
  monthlyPaymentValueRegular: number;
  monthlyPaymentValueLifted: number;
  bidAmount: number;
  value: number;
}

export interface ManualScheduleEntry {
  month: number;
  regularPay: number | '';
  liftedPay: number | '';
  bidAmount: number | '';
}

export interface ChitScheduleResult {
  rows: ChitScheduleRow[];
  totalCollected: number;
  totalPaidOut: number;
  agentEarnings: number;
  agentEarningsPct: number;
}

export function emptyManualSchedule(duration: number): ManualScheduleEntry[] {
  const months = Math.max(1, duration || 1);
  return Array.from({ length: months }, (_, i) => ({
    month: i + 1,
    regularPay: '',
    liftedPay: '',
    bidAmount: '',
  }));
}

export function resizeManualSchedule(
  existing: ManualScheduleEntry[],
  duration: number
): ManualScheduleEntry[] {
  const months = Math.max(1, duration || 1);
  return Array.from({ length: months }, (_, i) => {
    const prev = existing[i];
    return prev
      ? { ...prev, month: i + 1 }
      : { month: i + 1, regularPay: '' as const, liftedPay: '' as const, bidAmount: '' as const };
  });
}

function toNum(val: number | '' | null | undefined): number {
  if (val === '' || val === null || val === undefined) return 0;
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Choose a rounding step small enough that consecutive months can each increase.
 * Larger chits keep coarser steps (₹1,000); smaller rises use ₹100 / ₹50 / etc.
 */
function pickBidStepUnit(avgStep: number, totalAmount: number): number {
  if (avgStep >= 4000 || totalAmount >= 1000000) return 1000;
  if (avgStep >= 1500) return 500;
  if (avgStep >= 600) return 100;
  if (avgStep >= 200) return 50;
  if (avgStep >= 50) return 10;
  return 1;
}

/**
 * Helper to calculate dates by adding months
 */
export function getMonthDate(startDateStr: string | null | Date, monthIndex: number): string {
  if (!startDateStr) {
    return `Month ${monthIndex + 1}`;
  }
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) {
    return `Month ${monthIndex + 1}`;
  }
  date.setMonth(date.getMonth() + monthIndex);

  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabel = monthNames[date.getMonth()];
  const yearShort = date.getFullYear().toString().slice(-2);

  return `${day}-${monthLabel}-${yearShort}`;
}

/**
 * Generates the dynamic schedule and computes agent commission earnings
 */
export function generateChitSchedule(params: {
  calculationType: string;
  totalAmount: number;
  duration: number;
  monthlyContribution: number;
  liftedContribution: number | null;
  startBid: number | null;
  startDate: string | Date | null;
  commissionPct?: number;
  manualSchedule?: ManualScheduleEntry[] | null;
}): ChitScheduleResult {
  const {
    calculationType,
    totalAmount,
    duration,
    monthlyContribution,
    liftedContribution,
    startBid,
    startDate,
    commissionPct = 5,
    manualSchedule,
  } = params;

  const rows: ChitScheduleRow[] = [];
  let totalCollected = 0;
  let totalPaidOut = 0;

  if (calculationType === 'MANUAL') {
    const entries = (manualSchedule && manualSchedule.length > 0)
      ? resizeManualSchedule(manualSchedule, duration)
      : emptyManualSchedule(duration);
    const defaultRegular = monthlyContribution || 0;
    const defaultLifted = liftedContribution || defaultRegular;

    for (const entry of entries) {
      const regular = toNum(entry.regularPay) || defaultRegular;
      const lifted = toNum(entry.liftedPay) || defaultLifted;
      const bidAmount = toNum(entry.bidAmount);
      const prevWinnersCount = entry.month - 1;
      const nonWinnersCount = duration - prevWinnersCount;
      const monthPool = prevWinnersCount * lifted + nonWinnersCount * regular;
      totalCollected += monthPool;
      totalPaidOut += bidAmount;

      const payLabel = lifted !== regular
        ? `Regular: ₹${regular.toLocaleString('en-IN')} / Lifted: ₹${lifted.toLocaleString('en-IN')}`
        : `₹${regular.toLocaleString('en-IN')}`;

      rows.push({
        month: entry.month,
        date: getMonthDate(startDate, entry.month - 1),
        monthlyPaymentLabel: payLabel,
        monthlyPaymentValueRegular: regular,
        monthlyPaymentValueLifted: lifted,
        bidAmount,
        value: totalAmount,
      });
    }
  } else if (calculationType === 'VARIATION_1') {
    // Variation 1: Return/Lifted Contribution
    const L = liftedContribution || monthlyContribution * 1.25;
    const C = monthlyContribution;
    const commissionVal = totalAmount * (commissionPct / 100);

    for (let m = 1; m <= duration; m++) {
      const prevWinnersCount = m - 1;
      const nonWinnersCount = duration - m + 1;
      const totalPool = prevWinnersCount * L + nonWinnersCount * C;
      const bidAmount = Math.max(0, totalPool - commissionVal);

      totalCollected += totalPool;
      totalPaidOut += bidAmount;

      rows.push({
        month: m,
        date: getMonthDate(startDate, m - 1),
        monthlyPaymentLabel: `Regular: ₹${C.toLocaleString('en-IN')} / Lifted: ₹${L.toLocaleString('en-IN')}`,
        monthlyPaymentValueRegular: C,
        monthlyPaymentValueLifted: L,
        bidAmount: Math.round(bidAmount),
        value: totalAmount,
      });
    }
  } else {
    // Variation 2: Fixed Monthly Contribution
    // Uses the original fractions30 curve (preserves 5,00,000 shape).
    // Step size scales with the average monthly rise so every month increases
    // (e.g. 80,000 → 80,400 → 80,800) instead of plateauing on coarse rounding.
    const fixedPay = monthlyContribution;
    const startBidVal = startBid !== null && startBid !== undefined ? startBid : Math.round(totalAmount * 0.62);

    const fractions30 = [
      0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 45, 50, 55, 60, 66, 72, 78, 85, 94, 103, 112, 121, 130, 140, 150, 160, 170, 180, 190
    ].map(v => v / 190);

    const climbMonths = Math.max(1, duration - 1);
    const avgStep = Math.max(0, (totalAmount - startBidVal) / climbMonths);
    const stepUnit = pickBidStepUnit(avgStep, totalAmount);

    // Step 1: Compute raw bids via curve interpolation
    const bids: number[] = [];
    for (let m = 1; m <= duration; m++) {
      if (m === duration) {
        bids.push(totalAmount);
      } else if (m === 1) {
        bids.push(Math.round(startBidVal / stepUnit) * stepUnit);
      } else {
        const x = (m - 1) / (duration - 1);
        const idx = x * 29;
        const idxLow = Math.floor(idx);
        const idxHigh = Math.min(29, Math.ceil(idx));
        const w = idx - idxLow;
        const frac = (1 - w) * fractions30[idxLow] + w * fractions30[idxHigh];
        const raw = startBidVal + frac * (totalAmount - startBidVal);
        bids.push(Math.round(raw / stepUnit) * stepUnit);
      }
    }

    // Step 2: Strict increase each month — leave room so the last month can hit totalAmount
    for (let i = 1; i < bids.length - 1; i++) {
      const remainingAfter = bids.length - 1 - i;
      const maxAllowed = totalAmount - remainingAfter * stepUnit;
      bids[i] = Math.min(maxAllowed, Math.max(bids[i], bids[i - 1] + stepUnit));
    }
    bids[bids.length - 1] = totalAmount;

    for (let m = 1; m <= duration; m++) {
      const bidAmount = bids[m - 1];
      totalCollected += (duration * fixedPay);
      totalPaidOut += bidAmount;
      rows.push({
        month: m,
        date: getMonthDate(startDate, m - 1),
        monthlyPaymentLabel: `₹${fixedPay.toLocaleString('en-IN')}`,
        monthlyPaymentValueRegular: fixedPay,
        monthlyPaymentValueLifted: fixedPay,
        bidAmount,
        value: totalAmount,
      });
    }
  }

  const agentEarnings = totalCollected - totalPaidOut;
  const agentEarningsPct = totalCollected > 0 ? (agentEarnings / totalCollected) * 100 : 0;

  return {
    rows,
    totalCollected,
    totalPaidOut,
    agentEarnings: Math.round(agentEarnings),
    agentEarningsPct: parseFloat(agentEarningsPct.toFixed(2)),
  };
}

export function getSumFractions(duration: number): number {
  const fractions30 = [
    0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 45, 50, 55, 60, 66, 72, 78, 85, 94, 103, 112, 121, 130, 140, 150, 160, 170, 180, 190
  ].map(v => v / 190);

  let sum = 0;
  for (let m = 1; m <= duration; m++) {
    if (m === duration) {
      sum += 1;
    } else if (m > 1 && duration > 1) {
      const x = (m - 1) / (duration - 1);
      const idx = x * 29;
      const idxLow = Math.floor(idx);
      const idxHigh = Math.min(29, Math.ceil(idx));
      const w = idx - idxLow;
      const frac = (1 - w) * fractions30[idxLow] + w * fractions30[idxHigh];
      sum += frac;
    }
  }
  return sum;
}

export function suggestVariation2StartBid(
  totalAmount: number,
  duration: number,
  monthlyContribution: number,
  commissionPct: number
): number {
  const sumFrac = getSumFractions(duration);
  const totalCollected = duration * duration * monthlyContribution;
  const targetPaidOut = totalCollected * (1 - commissionPct / 100);

  const denom = duration - sumFrac;
  if (Math.abs(denom) < 0.001) return totalAmount * 0.62;

  const startBid = (targetPaidOut - totalAmount * sumFrac) / denom;
  return Math.round(startBid);
}

export function suggestVariation2MonthlyContribution(
  totalAmount: number,
  duration: number,
  startBid: number,
  commissionPct: number
): number {
  const sumFrac = getSumFractions(duration);
  const targetPaidOut = startBid * (duration - sumFrac) + totalAmount * sumFrac;

  const denom = duration * duration * (1 - commissionPct / 100);
  if (Math.abs(denom) < 0.001) return Math.round((totalAmount * 0.81) / duration);

  const C = targetPaidOut / denom;
  return Math.round(C);
}
