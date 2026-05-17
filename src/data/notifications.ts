import { Notification } from '../types';

export const mockNotifications: Notification[] = [
  {
    id: 'N1',
    title: 'Payment Received',
    message: 'Payment of ₹5,000 received for Royal Fortune 1L (May 2024).',
    time: '2 hours ago',
    type: 'success',
    isRead: false,
  },
  {
    id: 'N2',
    title: 'Upcoming Auction',
    message: 'Auction for Smart Savings 50k starts today at 5:00 PM.',
    time: '4 hours ago',
    type: 'info',
    isRead: false,
  },
  {
    id: 'N3',
    title: 'Payment Overdue',
    message: 'Amit Patel is 3 days late for Smart Savings 50k payment.',
    time: '1 day ago',
    type: 'warning',
    isRead: true,
  },
  {
    id: 'N4',
    title: 'New Member Joined',
    message: 'Vikram Singh has joined Elite Growth 5L.',
    time: '2 days ago',
    type: 'info',
    isRead: true,
  }
];
