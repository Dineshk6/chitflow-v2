export interface ChitScheduleRow {
  month: number;
  date: string;
  monthlyPaymentLabel: string;
  monthlyPaymentValueRegular: number;
  monthlyPaymentValueLifted: number;
  bidAmount: number;
  value: number;
}

export interface ChitScheduleResult {
  rows: ChitScheduleRow[];
  totalCollected: number;
  totalPaidOut: number;
  agentEarnings: number;
  agentEarningsPct: number;
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
  } = params;

  const rows: ChitScheduleRow[] = [];
  let totalCollected = 0;
  let totalPaidOut = 0;

  if (calculationType === 'VARIATION_1') {
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
    const fixedPay = monthlyContribution;
    const startBidVal = startBid !== null && startBid !== undefined ? startBid : totalAmount * 0.60;

    // Exact cumulative fractions from Rs. 5,00,000 Chit (30 Months) sheet:
    // Increments: 0, 4k, 8k, 12k, 16k, 20k, 24k, 28k, 32k, 36k, 40k, 45k, 50k, 55k, 60k, 66k, 72k, 78k, 85k, 94k, 103k, 112k, 121k, 130k, 140k, 150k, 160k, 170k, 180k, 190k
    const fractions30 = [
      0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 45, 50, 55, 60, 66, 72, 78, 85, 94, 103, 112, 121, 130, 140, 150, 160, 170, 180, 190
    ].map(v => v / 190);

    for (let m = 1; m <= duration; m++) {
      let bidAmount = startBidVal;
      if (m > 1 && duration > 1) {
        const x = (m - 1) / (duration - 1);
        const idx = x * 29;
        const idxLow = Math.floor(idx);
        const idxHigh = Math.min(29, Math.ceil(idx));
        const w = idx - idxLow;
        const frac = (1 - w) * fractions30[idxLow] + w * fractions30[idxHigh];
        bidAmount = startBidVal + frac * (totalAmount - startBidVal);
      }

      if (m === duration) {
        bidAmount = totalAmount;
      } else {
        bidAmount = Math.round(bidAmount / 1000) * 1000;
      }

      totalCollected += (duration * fixedPay);
      totalPaidOut += bidAmount;

      rows.push({
        month: m,
        date: getMonthDate(startDate, m - 1),
        monthlyPaymentLabel: `₹${fixedPay.toLocaleString('en-IN')}`,
        monthlyPaymentValueRegular: fixedPay,
        monthlyPaymentValueLifted: fixedPay,
        bidAmount: bidAmount,
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
  if (Math.abs(denom) < 0.001) return totalAmount * 0.60;
  
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
