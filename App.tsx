
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import CommitteeDetail from './components/CommitteeDetail';
import { useCommitteeData } from './hooks/useCommitteeData';

const App: React.FC = () => {
  const committeeData = useCommitteeData();
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string | null>(null);

  const selectedCommittee = committeeData.committees.find(c => c.id === selectedCommitteeId);

  const handleSelectCommittee = (id: string) => {
    setSelectedCommitteeId(id);
  };

  const handleBackToDashboard = () => {
    setSelectedCommitteeId(null);
  };

  return (
    <div className="min-h-screen bg-base-100 text-gray-200 font-sans">
      <header className="bg-base-200 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            Kameeti Manager
          </h1>
           {selectedCommittee && (
             <button
               onClick={handleBackToDashboard}
               className="text-primary hover:underline"
              >
              &larr; Back to Dashboard
            </button>
           )}
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        {!selectedCommittee ? (
          <Dashboard
            committees={committeeData.committees}
            onSelectCommittee={handleSelectCommittee}
            addCommittee={committeeData.addCommittee}
          />
        ) : (
          <CommitteeDetail
            committee={selectedCommittee}
            {...committeeData}
          />
        )}
      </main>
    </div>
  );
};

export default App;
