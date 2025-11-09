import React, { useState } from 'react';
import { Committee } from '../types';
import CreateCommitteeModal from './modals/CreateCommitteeModal';
import Button from './shared/Button';

interface DashboardProps {
  committees: Committee[];
  onSelectCommittee: (id: string) => void;
  addCommittee: (committee: Omit<Committee, 'id'>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ committees, onSelectCommittee, addCommittee }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Committees</h2>
        <Button onClick={() => setIsModalOpen(true)}>+ Create Committee</Button>
      </div>
      
      {committees.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg">
          <p className="text-gray-400">No committees found. Get started by creating one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {committees.map((committee) => {
            const startDate = new Date(committee.startDate);
            const now = new Date();
            
            const monthsPassed = Math.max(0, (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()));
            const progress = Math.min(100, (monthsPassed / committee.durationMonths) * 100);
            const isComplete = monthsPassed >= committee.durationMonths;
            const status = isComplete ? 'Complete' : 'Active';

            return (
              <div 
                key={committee.id}
                className="bg-base-200 p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                onClick={() => onSelectCommittee(committee.id)}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-primary truncate">{committee.name}</h3>
                     <span className={`px-2 py-1 text-xs font-bold rounded-full ${isComplete ? 'bg-base-300 text-gray-300' : 'bg-success text-black'}`}>
                        {status}
                     </span>
                  </div>
                  <p className="text-gray-400 mt-2">Amount: <span className="font-medium text-white">${committee.monthlyAmount.toLocaleString()}</span></p>
                  <p className="text-gray-400">Duration: <span className="font-medium text-white">{committee.durationMonths} months</span></p>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.min(monthsPassed, committee.durationMonths)} / {committee.durationMonths} Months</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateCommitteeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addCommittee}
      />
    </div>
  );
};

export default Dashboard;