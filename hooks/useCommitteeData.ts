
import { useState } from 'react';
import { Committee, Member, Payment, Draw, ShareType } from '../types';

// Mock Data
const initialCommittees: Committee[] = [
  { id: 'c1', name: 'Friends Savings 2024', monthlyAmount: 5000, durationMonths: 12, startDate: '2024-01-01', allowHalfShare: true },
  { id: 'c2', name: 'Office Fund', monthlyAmount: 10000, durationMonths: 10, startDate: '2024-03-01', allowHalfShare: false },
];

const initialMembers: Member[] = [
  { id: 'm1', committeeId: 'c1', name: 'Alice', phone: '123-456-7890', shareType: ShareType.FULL },
  // FIX: Corrected a syntax error where a stray quote was present after ShareType.HALF.
  { id: 'm2', committeeId: 'c1', name: 'Bob', phone: '123-456-7891', shareType: ShareType.HALF, pairId: 'p1' },
  // FIX: Corrected a syntax error where a stray quote was present after ShareType.HALF.
  { id: 'm3', committeeId: 'c1', name: 'Charlie', phone: '123-456-7892', shareType: ShareType.HALF, pairId: 'p1' },
  { id: 'm4', committeeId: 'c2', name: 'David', phone: '123-456-7893', shareType: ShareType.FULL },
];

const initialPayments: Payment[] = [
    { id: 'pay1', committeeId: 'c1', monthYear: '2024-01', memberIdOrPairId: 'm1', amount: 5000, datePaid: '2024-01-08', lateDays: 0, demeritPoints: 0 },
    { id: 'pay2', committeeId: 'c1', monthYear: '2024-01', memberIdOrPairId: 'p1', amount: 5000, datePaid: '2024-01-12', lateDays: 2, demeritPoints: 2 },
];

const initialDraws: Draw[] = [
    { id: 'draw1', committeeId: 'c1', monthYear: '2024-01', winnerIdOrPairId: 'm1', payoutDate: '2024-01-15', amount: 60000 }
];


export const useCommitteeData = () => {
  const [committees, setCommittees] = useState<Committee[]>(initialCommittees);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [draws, setDraws] = useState<Draw[]>(initialDraws);

  const addCommittee = (committee: Omit<Committee, 'id'>) => {
    const newCommittee = { ...committee, id: `c${Date.now()}` };
    setCommittees(prev => [...prev, newCommittee]);
  };

  const addMember = (member: Omit<Member, 'id' | 'pairId'>) => {
    // FIX: Explicitly type `newMember` as `Member` to allow adding the optional `pairId` property.
    const newMember: Member = { ...member, id: `m${Date.now()}` };
    
    if (newMember.shareType === ShareType.HALF) {
        const unpairedHalfMember = members.find(
            m => m.committeeId === newMember.committeeId && m.shareType === ShareType.HALF && !m.pairId
        );
        if (unpairedHalfMember) {
            const pairId = `p${Date.now()}`;
            newMember.pairId = pairId;
            setMembers(prev => prev.map(m => m.id === unpairedHalfMember.id ? {...m, pairId } : m).concat(newMember));
        } else {
            setMembers(prev => [...prev, newMember]);
        }
    } else {
        setMembers(prev => [...prev, newMember]);
    }
  };

  const recordPayment = (payment: Omit<Payment, 'id' | 'lateDays' | 'demeritPoints'>) => {
    const dueDate = new Date(`${payment.monthYear}-10`);
    const paidDate = new Date(payment.datePaid);
    const timeDiff = paidDate.getTime() - dueDate.getTime();
    const lateDays = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    const demeritPoints = lateDays; // 1 point per day late

    const newPayment = { ...payment, id: `pay${Date.now()}`, lateDays, demeritPoints };
    setPayments(prev => [...prev, newPayment]);
  };

  const recordDraw = (draw: Omit<Draw, 'id'>) => {
    const newDraw = { ...draw, id: `draw${Date.now()}` };
    setDraws(prev => [...prev, newDraw]);
  };

  return {
    committees,
    members,
    payments,
    draws,
    addCommittee,
    addMember,
    recordPayment,
    recordDraw,
  };
};
