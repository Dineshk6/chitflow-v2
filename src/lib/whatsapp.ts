type MemberWelcomeParams = {
  memberName: string;
  memberPhone?: string;
  groupName: string;
  chitCount?: number;
  monthlyContribution?: number;
  liftedContribution?: number | null;
  duration?: number;
  totalAmount?: number;
  membersLimit?: number;
  startDate?: string | Date | null;
  groupStatus?: string;
  currentMonth?: number;
  agentName?: string | null;
  agentPhone?: string | null;
  loginUrl?: string;
  isNewAccount?: boolean;
};

const money = (n?: number | null) =>
  typeof n === 'number' && !Number.isNaN(n)
    ? `₹${n.toLocaleString('en-IN')}`
    : null;

const formatDate = (value?: string | Date | null) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export function buildMemberWelcomeWhatsAppMessage({
  memberName,
  memberPhone,
  groupName,
  chitCount = 1,
  monthlyContribution,
  liftedContribution,
  duration,
  totalAmount,
  startDate,
  currentMonth,
  agentName,
  agentPhone,
  loginUrl,
  isNewAccount,
}: MemberWelcomeParams): string {
  const monthly = money(monthlyContribution);
  const lifted = money(liftedContribution);
  const value = money(totalAmount);
  const start = formatDate(startDate);

  const lines = [
    `Hi *${memberName}*, welcome to *${groupName}*.`,
    `Thank you for trusting us with your chit. We are happy to have you.`,
    ``,
    `Chits: *${chitCount}*`,
  ];

  if (value) lines.push(`Chit value: *${value}*`);
  if (monthly) lines.push(`Monthly: *${monthly}*`);
  if (lifted && lifted !== monthly) lines.push(`After lift: *${lifted}*`);
  if (duration) lines.push(`Duration: *${duration} months*`);
  if (start) lines.push(`Starts: *${start}*`);
  if (currentMonth) lines.push(`Current month: *${currentMonth}${duration ? ` of ${duration}` : ''}*`);

  if (loginUrl) {
    lines.push(``, `Login: ${loginUrl}`);
    if (memberPhone) lines.push(`Mobile: *${memberPhone}*`);
    if (isNewAccount) lines.push(`Password: *MemberPassword123!*`);
  }

  lines.push(
    ``,
    `We will keep you updated on payments and auctions.`,
    `Message us anytime if you need help.`
  );

  if (agentName || agentPhone) {
    const agent = [agentName, agentPhone].filter(Boolean).join(' · ');
    lines.push(``, agent);
  }

  return lines.join('\n');
}

export function openWhatsApp(phone: string, text: string) {
  const digits = String(phone || '').replace(/\D/g, '');
  const withCountry = digits.length === 10 ? `91${digits}` : digits;
  if (!withCountry) return;
  window.open(
    `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`,
    '_blank'
  );
}
