
import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Committee } from '../../types';

interface CreateCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (committee: Omit<Committee, 'id'>) => void;
}

const CreateCommitteeModal: React.FC<CreateCommitteeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [startDate, setStartDate] = useState('');
  const [allowHalfShare, setAllowHalfShare] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !monthlyAmount || !durationMonths || !startDate) {
      alert('Please fill all fields');
      return;
    }
    onSave({
      name,
      monthlyAmount: parseFloat(monthlyAmount),
      durationMonths: parseInt(durationMonths, 10),
      startDate,
      allowHalfShare,
    });
    onClose();
    // Reset form
    setName('');
    setMonthlyAmount('');
    setDurationMonths('');
    setStartDate('');
    setAllowHalfShare(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Committee">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Committee Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Monthly Amount</label>
              <input type="number" value={monthlyAmount} onChange={(e) => setMonthlyAmount(e.target.value)} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Duration (Months)</label>
              <input type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary" required />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary" required />
        </div>
        <div className="flex items-center">
            <input type="checkbox" id="half-share" checked={allowHalfShare} onChange={(e) => setAllowHalfShare(e.target.checked)} className="h-4 w-4 rounded border-gray-600 bg-base-300 text-primary focus:ring-primary"/>
            <label htmlFor="half-share" className="ml-2 block text-sm text-gray-300">Allow half-share participation</label>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create Committee</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCommitteeModal;
