import { Customer } from '../types';

export const mockCustomers: Customer[] = [
  {
    id: 'C1',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.k@example.com',
    joinedGroups: ['G1', 'G2'],
    totalDues: 0,
    paymentStatus: 'up-to-date',
  },
  {
    id: 'C2',
    name: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya.s@example.com',
    joinedGroups: ['G1', 'G5'],
    totalDues: 5000,
    paymentStatus: 'pending',
  },
  {
    id: 'C3',
    name: 'Amit Patel',
    phone: '+91 76543 21098',
    email: 'amit.p@example.com',
    joinedGroups: ['G2'],
    totalDues: 10000,
    paymentStatus: 'delayed',
  },
  {
    id: 'C4',
    name: 'Sneha Reddy',
    phone: '+91 65432 10987',
    email: 'sneha.r@example.com',
    joinedGroups: ['G1', 'G3'],
    totalDues: 0,
    paymentStatus: 'up-to-date',
  },
  {
    id: 'C5',
    name: 'Vikram Singh',
    phone: '+91 54321 09876',
    email: 'vikram.s@example.com',
    joinedGroups: ['G5'],
    totalDues: 0,
    paymentStatus: 'up-to-date',
  },
  {
    id: 'C6',
    name: 'Anjali Gupta',
    phone: '+91 43210 98765',
    email: 'anjali.g@example.com',
    joinedGroups: ['G1', 'G2'],
    totalDues: 2500,
    paymentStatus: 'pending',
  }
];
