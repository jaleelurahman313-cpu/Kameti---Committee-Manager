
import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Member, ShareType } from '../../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<Member, 'id' | 'pairId'>) => void;
  committeeId: string;
  allowHalfShare: boolean;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onSave, committeeId, allowHalfShare }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shareType, setShareType] = useState<ShareType>(ShareType.FULL);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
        alert('Please fill all fields');
        return;
    }
    onSave({
      committeeId,
      name,
      phone,
      shareType,
    });
    onClose();
    // Reset form
    setName('');
    setPhone('');
    setShareType(ShareType.FULL);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Share Type</label>
          <select 
            value={shareType} 
            onChange={(e) => setShareType(e.target.value as ShareType)} 
            className="w-full bg-base-300 rounded-md border border-gray-600 px-3 py-2 focus:ring-primary focus:border-primary"
          >
            <option value={ShareType.FULL}>Full Share</option>
            {allowHalfShare && <option value={ShareType.HALF}>Half Share</option>}
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Add Member</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMemberModal;
