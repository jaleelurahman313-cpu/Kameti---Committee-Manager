import React, { useState, useMemo } from 'react';
import { Committee, Member, Payment, Draw, ShareType } from '../types';
import Button from './shared/Button';
import AddMemberModal from './modals/AddMemberModal';
import RecordPaymentModal from './modals/RecordPaymentModal';
import RecordDrawModal from './modals/RecordDrawModal';

interface CommitteeDetailProps {
  committee: Committee;
  members: Member[];
  payments: Payment[];
  draws: Draw[];
  addMember: (member: Omit<Member, 'id' | 'pairId'>) => void;
  recordPayment: (payment: Omit<Payment, 'id' | 'lateDays' | 'demeritPoints'>) => void;
  recordDraw: (draw: Omit<Draw, 'id'>) => void;
}

type Tab = 'members' | 'payments' | 'draws';

const CommitteeDetail: React.FC<CommitteeDetailProps> = (props) => {
  const { committee } = props;
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);
  const [isRecordDrawModalOpen, setRecordDrawModalOpen] = useState(false);

  const [selectedPaymentInfo, setSelectedPaymentInfo] = useState<{ id: string; month: string } | null>(null);

  const committeeMembers = useMemo(() => props.members.filter(m => m.committeeId === committee.id), [props.members, committee.id]);

  const handleRecordPayment = (info: { id: string; month: string } | null) => {
    setSelectedPaymentInfo(info);
    setRecordPaymentModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <CommitteeHeader committee={committee} />

      <div className="flex border-b border-base-300">
        <TabButton name="Members" tab="members" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton name="Payments" tab="payments" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton name="Draws" tab="draws" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div>
        {activeTab === 'members' && (
          <MembersSection
            members={committeeMembers}
            onAddMember={() => setAddMemberModalOpen(true)}
            committee={committee}
          />
        )}
        {activeTab === 'payments' && (
          <PaymentsSection
            committee={committee}
            members={committeeMembers}
            payments={props.payments}
            onRecordPayment={handleRecordPayment}
          />
        )}
        {activeTab === 'draws' && (
            <DrawsSection 
                committee={committee}
                members={committeeMembers}
                draws={props.draws}
                onRecordDraw={() => setRecordDrawModalOpen(true)}
            />
        )}
      </div>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        onSave={props.addMember}
        committeeId={committee.id}
        allowHalfShare={committee.allowHalfShare}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentModalOpen}
        onClose={() => setRecordPaymentModalOpen(false)}
        onSave={props.recordPayment}
        committee={committee}
        members={committeeMembers}
        memberIdOrPairId={selectedPaymentInfo?.id}
        monthYear={selectedPaymentInfo?.month}
      />
      
      <RecordDrawModal
        isOpen={isRecordDrawModalOpen}
        onClose={() => setRecordDrawModalOpen(false)}
        onSave={props.recordDraw}
        committee={committee}
        members={committeeMembers}
        draws={props.draws}
      />
    </div>
  );
};

// Sub-components
const CommitteeHeader: React.FC<{ committee: Committee }> = ({ committee }) => (
  <div className="bg-base-200 p-6 rounded-lg shadow-lg">
    <h2 className="text-3xl font-bold text-primary">{committee.name}</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
      <div><span className="font-semibold text-gray-400">Monthly Amount:</span> ${committee.monthlyAmount.toLocaleString()}</div>
      <div><span className="font-semibold text-gray-400">Duration:</span> {committee.durationMonths} Months</div>
      <div><span className="font-semibold text-gray-400">Total Payout:</span> ${(committee.monthlyAmount * committee.durationMonths).toLocaleString()}</div>
      <div><span className="font-semibold text-gray-400">Starts:</span> {new Date(committee.startDate).toLocaleDateString()}</div>
    </div>
  </div>
);

const TabButton: React.FC<{ name: string; tab: Tab; activeTab: Tab; setActiveTab: (tab: Tab) => void }> = ({ name, tab, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(tab)}
    className={`px-4 py-2 text-lg font-medium transition-colors duration-200 ${
      activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-white'
    }`}
  >
    {name}
  </button>
);

const MembersSection: React.FC<{ members: Member[]; onAddMember: () => void; committee: Committee; }> = ({ members, onAddMember, committee }) => {
    const pairedMembers = useMemo(() => {
        const pairs: { [key: string]: Member[] } = {};
        const fullMembers: Member[] = [];
        const unpairedHalf: Member[] = [];

        members.forEach(m => {
            if (m.shareType === ShareType.FULL) {
                fullMembers.push(m);
            } else if (m.pairId) {
                if (!pairs[m.pairId]) pairs[m.pairId] = [];
                pairs[m.pairId].push(m);
            } else {
                unpairedHalf.push(m);
            }
        });
        return { pairs, fullMembers, unpairedHalf };
    }, [members]);

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Committee Members ({members.length} / {committee.durationMonths})</h3>
                <Button onClick={onAddMember}>+ Add Member</Button>
            </div>
            {pairedMembers.unpairedHalf.length > 0 && 
                <div className="p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg text-yellow-300">
                    Warning: There is an unpaired half-share member. Please add another half-share member to form a pair.
                </div>
            }
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pairedMembers.fullMembers.map(m => (
                    <div key={m.id} className="bg-base-200 p-4 rounded-lg">
                        <p className="font-bold text-lg">{m.name}</p>
                        <p className="text-sm text-gray-400">{m.phone}</p>
                        <span className="mt-2 inline-block bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">{m.shareType}</span>
                    </div>
                ))}
                {Object.values(pairedMembers.pairs).map(pair => (
                     <div key={pair[0].pairId} className="bg-base-200 p-4 rounded-lg border-l-4 border-secondary">
                        <p className="font-bold text-lg">Pair</p>
                        {pair.map(m => (
                             <p key={m.id} className="text-md pl-2">- {m.name} <span className="text-gray-400 text-sm">({m.phone})</span></p>
                        ))}
                         <span className="mt-2 inline-block bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">{ShareType.HALF} Share</span>
                    </div>
                ))}
                {pairedMembers.unpairedHalf.map(m => (
                    <div key={m.id} className="bg-base-200 p-4 rounded-lg border-l-4 border-yellow-500">
                        <p className="font-bold text-lg">{m.name}</p>
                        <p className="text-sm text-gray-400">{m.phone}</p>
                        <span className="mt-2 inline-block bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">Pending Pair</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const PaymentsSection: React.FC<{ committee: Committee; members: Member[]; payments: Payment[]; onRecordPayment: (info: { id: string; month: string } | null) => void; }> = ({ committee, members, payments, onRecordPayment }) => {
    const months = useMemo(() => {
        const start = new Date(committee.startDate);
        return Array.from({ length: committee.durationMonths }, (_, i) => {
            const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
            return date.toISOString().slice(0, 7); // YYYY-MM
        });
    }, [committee.startDate, committee.durationMonths]);

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

    const getPaymentStatus = (id: string, month: string) => {
        return payments.find(p => p.memberIdOrPairId === id && p.monthYear === month);
    }
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Monthly Payments</h3>
                <Button onClick={() => onRecordPayment(null)}>+ Record Payment</Button>
            </div>
            <div className="overflow-x-auto bg-base-200 rounded-lg p-4">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-base-300">
                            <th className="p-3">Member / Pair</th>
                            {months.map(m => <th key={m} className="p-3 text-center">{new Date(m + '-02').toLocaleString('default', { month: 'short', year: 'numeric' })}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {memberRows.map(row => (
                            <tr key={row.id} className="border-b border-base-300 last:border-0 hover:bg-base-300/50">
                                <td className="p-3 font-semibold">{row.name}</td>
                                {months.map(month => {
                                    const payment = getPaymentStatus(row.id, month);
                                    return (
                                        <td key={month} className="p-3 text-center">
                                            {payment ? (
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                    payment.lateDays > 0 
                                                    ? 'bg-warning text-black cursor-default' 
                                                    : 'bg-success text-black cursor-default'
                                                }`}>
                                                    {payment.lateDays > 0 ? `Late (${payment.lateDays}d)` : 'Paid'}
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => onRecordPayment({ id: row.id, month })}
                                                    className="text-primary hover:underline text-xs font-semibold"
                                                >
                                                    Record
                                                </button>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const DrawsSection: React.FC<{ committee: Committee; members: Member[]; draws: Draw[]; onRecordDraw: () => void;}> = ({ committee, members, draws, onRecordDraw }) => {
    const committeeDraws = draws.filter(d => d.committeeId === committee.id);

    const findWinnerName = (id: string) => {
        const member = members.find(m => m.id === id);
        if (member) return member.name;

        const pairMembers = members.filter(m => m.pairId === id);
        if (pairMembers.length > 0) return pairMembers.map(m => m.name).join(' & ');
        
        return 'Unknown';
    };

    return (
         <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Draw History</h3>
                <Button onClick={onRecordDraw}>+ Record Draw</Button>
            </div>
            <div className="bg-base-200 p-4 rounded-lg">
                {committeeDraws.length > 0 ? (
                    <ul className="space-y-3">
                        {committeeDraws.map(draw => (
                            <li key={draw.id} className="p-3 bg-base-300 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-primary">{findWinnerName(draw.winnerIdOrPairId)}</p>
                                    <p className="text-sm text-gray-400">Month: {draw.monthYear} | Payout: ${draw.amount.toLocaleString()}</p>
                                </div>
                                <span className="text-xs text-gray-300">Paid on {new Date(draw.payoutDate).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-center py-4">No draws have been recorded yet.</p>
                )}
            </div>
        </div>
    )
}

export default CommitteeDetail;