import { Winner } from '../types';

export const mockWinners: Winner[] = [
  {
    id: 'W1',
    groupId: 'G1',
    groupName: 'Royal Fortune 1L',
    customerId: 'C1',
    customerName: 'Rajesh Kumar',
    amount: 85000,
    dividend: 750,
    month: 7,
    date: '2024-04-15',
  },
  {
    id: 'W2',
    groupId: 'G2',
    groupName: 'Smart Savings 50k',
    customerId: 'C6',
    customerName: 'Anjali Gupta',
    amount: 42000,
    dividend: 800,
    month: 2,
    date: '2024-04-10',
  },
  {
    id: 'W3',
    groupId: 'G5',
    groupName: 'Blue Chip 10L',
    customerId: 'C5',
    customerName: 'Vikram Singh',
    amount: 820000,
    dividend: 9000,
    month: 11,
    date: '2024-03-20',
  }
];
