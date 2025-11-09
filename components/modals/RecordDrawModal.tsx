
import React, { useState, useMemo } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Committee, Member, Draw, ShareType } from '../../types';

interface RecordDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (draw: Omit<Draw, 'id'>) => void;
  committee: Committee;
  members: Member[];
  draws: Draw[];
}

const RecordDrawModal: React.FC<RecordDrawModalProps> = ({ isOpen, onClose, onSave, committee, members, draws }) => {
  
  const eligibleWinners = useMemo(() => {
    const wonIds = new Set(draws.filter(d => d.committeeId === committee.id).map(d => d.winnerIdOrPairId));
    const fullMembers = members.filter(m => m.shareType === ShareType.FULL && !wonIds.has(m.id));
    const pairs = Object.values(members.reduce((acc, m) => {
        if (m.shareType === ShareType.HALF && m.pairId && !wonIds.has(m.pairId)) {
            if (!acc[m.pairId]) acc[m.pairId] = { id: m.pairId, name: '', members: [] };
            acc[m.pairId].members.push(m);
            acc[m.pairId].name = acc[m.pairId].members.map(mem => mem.name).join(' & ');
        }
        return acc;
    }, {} as { [key: string]: { id: string; name: string, members: Member[] } }));
    return [...fullMembers, ...pairs];
  }, [members, draws, committee.id]);
  
  const currentMonthYear = useMemo(() => {
    const startDate = new Date(committee.startDate);
    const committeeDrawsCount = draws.filter(d => d.committeeId === committee.id).length;
    const date = new Date(startDate.getFullYear(), startDate.getMonth() + committeeDrawsCount, 1);
    return date.toISOString().slice(0, 7); // YYYY-MM
  }, [committee, draws]);

  const [winnerId, setWinnerId] = useState(eligibleWinners[0]?.id || '');
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winnerId) {
        alert('Please select a winner.');
        return;
    }
    onSave({
      committeeId: committee.id,
      monthYear: currentMonthYear,
      winnerIdOrPairId: winnerId,
      payoutDate,
      amount: committee.monthlyAmount * committee.durationMonths,
    });
    onClose();
    setWinnerId(eligibleWinners[0]?.id || '');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record Draw for ${currentMonthYear}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Select Winner</label>
          <select value={winnerId} onChange={(e) => setWinnerId(e.target.value)} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary" required>
            <option value="" disabled>-- Select a member or pair --</option>
            {eligibleWinners.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Payout Amount</label>
              <input type="text" value={`$${(committee.monthlyAmount * committee.durationMonths).toLocaleString()}`} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2" readOnly />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Payout Date</label>
                <input type="date" value={payoutDate} onChange={e => setPayoutDate(e.target.value)} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary" required />
            </div>
        </div>
        {eligibleWinners.length === 0 && (
            <p className="text-center text-yellow-400">No eligible winners remaining for this committee.</p>
        )}
         <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={eligibleWinners.length === 0}>Record Draw</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordDrawModal;
