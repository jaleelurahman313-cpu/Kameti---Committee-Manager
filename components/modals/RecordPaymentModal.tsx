import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Committee, Member, Payment, ShareType } from '../../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Omit<Payment, 'id' | 'lateDays' | 'demeritPoints'>) => void;
  committee: Committee;
  members: Member[];
  memberIdOrPairId?: string;
  monthYear?: string;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, onSave, committee, members, memberIdOrPairId, monthYear }) => {
  const [selectedMemberId, setSelectedMemberId] = useState(memberIdOrPairId || '');
  const [selectedMonth, setSelectedMonth] = useState(monthYear || '');
  const [datePaid, setDatePaid] = useState(new Date().toISOString().slice(0, 10));
  
  const amount = committee.monthlyAmount;

  useEffect(() => {
    if (isOpen) {
        setSelectedMemberId(memberIdOrPairId || '');
        setSelectedMonth(monthYear || '');
        setDatePaid(new Date().toISOString().slice(0, 10));
    }
  }, [isOpen, memberIdOrPairId, monthYear]);

  const memberRows = useMemo(() => {
    const full = members.filter(m => m.shareType === ShareType.FULL);
    const pairs = Object.values(members.reduce((acc, m) => {
        if (m.shareType === ShareType.HALF && m.pairId) {
            if (!acc[m.pairId]) acc[m.pairId] = { id: m.pairId, name: '', members: [] };
            acc[m.pairId].members.push(m);
            acc[m.pairId].name = acc[m.pairId].members.map(mem => mem.name).join(' & ');
        }
        return acc;
    }, {} as { [key: string]: { id: string; name: string, members: Member[] } }));
    return [...full, ...pairs];
  }, [members]);

  const months = useMemo(() => {
    const start = new Date(committee.startDate);
    return Array.from({ length: committee.durationMonths }, (_, i) => {
        const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
        return date.toISOString().slice(0, 7); // YYYY-MM
    });
  }, [committee.startDate, committee.durationMonths]);

  const memberName = useMemo(() => {
    const member = memberRows.find(m => m.id === (memberIdOrPairId || selectedMemberId));
    return member ? member.name : "N/A";
  }, [memberRows, memberIdOrPairId, selectedMemberId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!selectedMemberId || !selectedMonth) {
        alert('Please select a member and a month.');
        return;
    }
    onSave({
      committeeId: committee.id,
      monthYear: selectedMonth,
      memberIdOrPairId: selectedMemberId,
      amount,
      datePaid,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment for ${selectedMonth || '...'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Member / Pair</label>
          {memberIdOrPairId ? (
            <input type="text" value={memberName} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2" readOnly />
          ) : (
            <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary" required>
              <option value="" disabled>-- Select Member/Pair --</option>
              {memberRows.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Month</label>
          {monthYear ? (
              <input type="text" value={new Date(monthYear + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2" readOnly />
          ) : (
             <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary" required>
                <option value="" disabled>-- Select Month --</option>
                {months.map(m => <option key={m} value={m}>{new Date(m + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>)}
            </select>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
              <input type="text" value={`$${amount.toLocaleString()}`} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2" readOnly />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date Paid</label>
                <input type="date" value={datePaid} onChange={e => setDatePaid(e.target.value)} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary" required />
            </div>
        </div>
         <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Record Payment</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;