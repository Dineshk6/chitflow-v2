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

const titleCase = (value?: string) =>
  value ? value.charAt(0) + value.slice(1).toLowerCase() : null;

export function buildMemberWelcomeWhatsAppMessage({
  memberName,
  memberPhone,
  groupName,
  chitCount = 1,
  monthlyContribution,
  liftedContribution,
  duration,
  totalAmount,
  membersLimit,
  startDate,
  groupStatus,
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
  const statusLabel = titleCase(groupStatus);
  const registeredOn = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const lines = [
    `✨ *Welcome to ChitFlow*`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `Dear *${memberName}*,`,
    ``,
    `🎉 You have been *successfully registered* in our chit fund.`,
    ``,
    `📁 *Group*`,
    `• Name: *${groupName}*`,
  ];

  if (statusLabel) lines.push(`• Status: *${statusLabel}*`);
  if (start) lines.push(`• Start date: *${start}*`);
  if (currentMonth) lines.push(`• Current month: *${currentMonth}${duration ? ` of ${duration}` : ''}*`);

  lines.push(``, `📋 *Your Membership*`);
  lines.push(`• Member: *${memberName}*`);
  if (memberPhone) lines.push(`• Mobile: *${memberPhone}*`);
  lines.push(`• Chit tickets: *${chitCount}*`);
  lines.push(`• Membership: *Active*`);
  lines.push(`• Registered on: *${registeredOn}*`);

  lines.push(``, `💰 *Scheme Details*`);
  if (value) lines.push(`• Chit value: *${value}*`);
  if (monthly) lines.push(`• Monthly contribution: *${monthly}*`);
  if (lifted && lifted !== monthly) {
    lines.push(`• After lift contribution: *${lifted}*`);
  }
  if (duration) lines.push(`• Duration: *${duration} months*`);
  if (membersLimit) lines.push(`• Members in group: *${membersLimit}*`);

  lines.push(
    ``,
    `📌 *What happens next*`,
    `1️⃣ Track monthly dues & payments`,
    `2️⃣ Join auctions when your turn comes`,
    `3️⃣ Get updates from your agent on WhatsApp`,
    `4️⃣ View your full summary anytime in the member app`
  );

  if (loginUrl) {
    lines.push(
      ``,
      `🔐 *Member Login*`,
      loginUrl,
      `Use your registered mobile number to sign in.`
    );
    if (isNewAccount) {
      lines.push(`Temporary password: *MemberPassword123!*`);
      lines.push(`Please change it after first login.`);
    }
  }

  lines.push(
    ``,
    `Thank you for trusting us. We're happy to have you on board. 🙌`,
    ``,
    `For any help, reply on WhatsApp or contact your agent.`
  );

  if (agentName || agentPhone) {
    lines.push(``, `━━━━━━━━━━━━━━━━━━`);
    if (agentName) lines.push(`👤 Agent: *${agentName}*`);
    if (agentPhone) lines.push(`📞 ${agentPhone}`);
    lines.push(`*ChitFlow* • Smart Chit Management`);
  } else {
    lines.push(``, `— *ChitFlow Team*`);
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
