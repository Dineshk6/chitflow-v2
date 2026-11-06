import { jsPDF } from 'jspdf';
import { generateChitSchedule } from '@/lib/chitCalculations';

type Rgb = [number, number, number];

const C = {
  blue: [37, 99, 235] as Rgb,
  blueDark: [30, 64, 175] as Rgb,
  ink: [15, 23, 42] as Rgb,
  slate700: [51, 65, 85] as Rgb,
  slate500: [100, 116, 139] as Rgb,
  slate100: [241, 245, 249] as Rgb,
  slate50: [248, 250, 252] as Rgb,
  white: [255, 255, 255] as Rgb,
  border: [226, 232, 240] as Rgb,
  green: [21, 128, 61] as Rgb,
};

const PAGE_W = 210;
const PAGE_H = 297;
const LEFT = 12;
const RIGHT = 198;
const WIDTH = RIGHT - LEFT;

const rupee = (n: number) =>
  `Rs. ${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

export type SchemePdfGroup = {
  name: string;
  totalAmount?: number;
  totalValue?: number;
  duration?: number;
  monthlyContribution?: number;
  liftedContribution?: number | null;
  calculationType?: string;
  startBid?: number | null;
  startDate?: string | Date | null;
  membersLimit?: number;
  commissionPct?: number;
  manualSchedule?: any;
  status?: string;
};

export type SchemePdfAgent = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type SchemePdfOptions = {
  startDate?: string | Date | null;
};

/** Date-only strings stay on the chosen calendar day in local time. */
export function parseSchemeStartDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const dayOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (dayOnly) {
    return new Date(Number(dayOnly[1]), Number(dayOnly[2]) - 1, Number(dayOnly[3]));
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function toSchemeDateInputValue(value?: string | Date | null): string {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value.trim())) {
    return value.trim().slice(0, 10);
  }
  const date = parseSchemeStartDate(value);
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function setFill(doc: jsPDF, c: Rgb) {
  doc.setFillColor(c[0], c[1], c[2]);
}
function setStroke(doc: jsPDF, c: Rgb) {
  doc.setDrawColor(c[0], c[1], c[2]);
}
function setText(doc: jsPDF, c: Rgb) {
  doc.setTextColor(c[0], c[1], c[2]);
}

function formatLongDate(value: Date | null) {
  if (!value) return 'Not set';
  return value.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function monthDate(start: Date | null, monthIndex: number) {
  if (!start) return `Month ${monthIndex + 1}`;
  const date = new Date(start.getTime());
  date.setMonth(date.getMonth() + monthIndex);
  return formatLongDate(date);
}

type Col = {
  label: string;
  x: number;
  align: 'left' | 'right' | 'center';
};

function drawFooter(doc: jsPDF) {
  setStroke(doc, C.border);
  doc.setLineWidth(0.3);
  doc.line(LEFT, 286, RIGHT, 286);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setText(doc, C.slate500);
  doc.text('ChitFlow  ·  Scheme schedule', LEFT, 292);
}

function paintPageNumber(doc: jsPDF, page: number, total: number) {
  setFill(doc, C.white);
  doc.rect(150, 287, 48, 7, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setText(doc, C.slate500);
  doc.text(`Page ${page} of ${total}`, RIGHT, 292, { align: 'right' });
}

function drawTableHeader(doc: jsPDF, y: number, cols: Col[]) {
  setFill(doc, C.ink);
  doc.rect(LEFT, y, WIDTH, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setText(doc, C.white);
  cols.forEach((col) => {
    doc.text(col.label, col.x, y + 6, { align: col.align });
  });
  return y + 9;
}

/**
 * A4 scheme schedule. No calculation-model name is printed.
 * The table uses short labels and 10pt type so it stays readable on a phone.
 */
export function downloadSchemeSchedulePdf(
  group: SchemePdfGroup,
  agent?: SchemePdfAgent,
  options?: SchemePdfOptions
) {
  const totalAmount = group.totalAmount || group.totalValue || 0;
  const duration = group.duration || 10;
  const monthlyContribution = group.monthlyContribution || 0;
  const liftedContribution = group.liftedContribution ?? null;
  const calculationType = group.calculationType || 'VARIATION_1';
  const startBid = group.startBid ?? null;
  const startDate = parseSchemeStartDate(
    options?.startDate !== undefined ? options.startDate : group.startDate
  );
  const membersLimit = group.membersLimit || duration || 20;
  const commissionPct =
    group.commissionPct !== undefined ? group.commissionPct : 5.0;
  const showLifted =
    calculationType === 'VARIATION_1' || calculationType === 'MANUAL';

  const schedule = generateChitSchedule({
    calculationType,
    totalAmount,
    duration,
    monthlyContribution,
    liftedContribution,
    startBid,
    startDate,
    commissionPct,
    manualSchedule: group.manualSchedule || null,
  });

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const startLabel = formatLongDate(startDate);
  const issued = formatLongDate(new Date());
  const agentName = agent?.name || 'Admin';
  const agentContact =
    (agent?.phone && !String(agent.phone).startsWith('no-phone')
      ? agent.phone
      : null) ||
    agent?.email ||
    '';
  const liftedPay = showLifted
    ? liftedContribution || Math.round(monthlyContribution * 1.25)
    : null;
  const groupName = String(group.name || 'Chit Group');

  const cols: Col[] = showLifted
    ? [
        { label: 'MONTH', x: 22, align: 'center' },
        { label: 'DATE', x: 36, align: 'left' },
        { label: 'REGULAR', x: 118, align: 'right' },
        { label: 'LIFTED', x: 154, align: 'right' },
        { label: 'PRIZE', x: 194, align: 'right' },
      ]
    : [
        { label: 'MONTH', x: 24, align: 'center' },
        { label: 'DATE', x: 42, align: 'left' },
        { label: 'MONTHLY PAY', x: 140, align: 'right' },
        { label: 'PRIZE', x: 194, align: 'right' },
      ];

  const rowH = 8.2;
  const bottom = 280;

  const drawIdentity = (compact: boolean) => {
    if (compact) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      setText(doc, C.ink);
      const continued = doc.splitTextToSize(groupName, 120) as string[];
      doc.text(continued[0], LEFT, 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setText(doc, C.slate500);
      doc.text(`Starts ${startLabel}`, RIGHT, 14, { align: 'right' });
      return 18;
    }

    setFill(doc, C.blue);
    doc.rect(0, 0, PAGE_W, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    setText(doc, C.white);
    doc.text('ChitFlow', LEFT, 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SCHEME SCHEDULE', RIGHT, 11, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Issued ${issued}`, RIGHT, 17, { align: 'right' });

    const agentLine = `${agentName}${agentContact ? `   ·   ${agentContact}` : ''}`;
    doc.text(doc.splitTextToSize(agentLine, 110)[0], LEFT, 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    setText(doc, C.ink);
    const nameLines = doc.splitTextToSize(groupName, WIDTH) as string[];
    doc.text(nameLines.slice(0, 2), LEFT, 40);
    let y = 40 + Math.max(0, nameLines.slice(0, 2).length - 1) * 6 + 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setText(doc, C.slate700);
    doc.text(`Starts ${startLabel}`, LEFT, y);
    doc.text(`${membersLimit} members`, RIGHT, y, { align: 'right' });
    y += 6;

    const tiles = [
      { label: 'Chit value', value: rupee(totalAmount) },
      { label: 'Monthly pay', value: rupee(monthlyContribution) },
      {
        label: showLifted ? 'Lifted pay' : 'Pay after lift',
        value: liftedPay != null ? rupee(liftedPay) : 'Same as monthly',
      },
      { label: 'Duration', value: `${duration} months` },
    ];
    const gap = 3;
    const tileW = (WIDTH - gap * 3) / 4;
    const tileH = 16;
    tiles.forEach((tile, index) => {
      const x = LEFT + index * (tileW + gap);
      setFill(doc, C.slate50);
      doc.roundedRect(x, y, tileW, tileH, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      setText(doc, C.slate500);
      doc.text(tile.label, x + 3, y + 6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      setText(doc, C.ink);
      const value = doc.splitTextToSize(tile.value, tileW - 6) as string[];
      doc.text(value[0], x + 3, y + 12);
    });

    return y + tileH + 8;
  };

  let y = drawIdentity(false);
  y = drawTableHeader(doc, y, cols);
  drawFooter(doc);

  const nextPage = () => {
    doc.addPage();
    drawFooter(doc);
    y = drawIdentity(true);
    y = drawTableHeader(doc, y, cols);
  };

  schedule.rows.forEach((row, idx) => {
    if (y + rowH > bottom) nextPage();

    if (idx % 2 === 0) {
      setFill(doc, C.slate50);
      doc.rect(LEFT, y, WIDTH, rowH, 'F');
    }

    const mid = y + 5.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setText(doc, C.ink);
    doc.text(String(row.month), showLifted ? 22 : 24, mid, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    setText(doc, C.slate700);
    doc.text(monthDate(startDate, row.month - 1), showLifted ? 36 : 42, mid);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setText(doc, C.ink);
    if (showLifted) {
      doc.text(rupee(row.monthlyPaymentValueRegular), 118, mid, { align: 'right' });
      setText(doc, C.green);
      doc.text(rupee(row.monthlyPaymentValueLifted), 154, mid, { align: 'right' });
      setText(doc, C.blueDark);
      doc.text(rupee(row.bidAmount), 194, mid, { align: 'right' });
    } else {
      doc.text(rupee(row.monthlyPaymentValueRegular), 140, mid, { align: 'right' });
      setText(doc, C.blueDark);
      doc.text(rupee(row.bidAmount), 194, mid, { align: 'right' });
    }

    y += rowH;
  });

  if (y + 12 > bottom) nextPage();
  y += 4;
  setStroke(doc, C.border);
  doc.setLineWidth(0.3);
  doc.line(LEFT, y, RIGHT, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(doc, C.slate700);
  doc.text(
    `${duration} months   ·   ${membersLimit} members   ·   Starts ${startLabel}`,
    LEFT,
    y
  );
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setText(doc, C.ink);
  doc.text(rupee(totalAmount), RIGHT, y, { align: 'right' });

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    paintPageNumber(doc, i, total);
  }

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${groupName.replace(/\s+/g, '_')}_Scheme_Schedule.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
