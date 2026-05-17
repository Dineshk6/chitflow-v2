export interface Group {
  id: string;
  name: string;
  totalAmount: number;
  monthlyContribution: number;
  duration: number;
  currentMonth: number;
  membersCount: number;
  maxMembers: number;
  status: 'active' | 'completed' | 'upcoming';
  progress: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinedGroups: string[];
  totalDues: number;
  paymentStatus: 'up-to-date' | 'delayed' | 'pending';
  avatar?: string;
}

export interface Collection {
  id: string;
  groupId: string;
  customerId: string;
  customerName: string;
  groupName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'late';
  month: string;
}

export interface Winner {
  id: string;
  groupId: string;
  groupName: string;
  customerId: string;
  customerName: string;
  amount: number;
  dividend: number;
  month: number;
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
}
