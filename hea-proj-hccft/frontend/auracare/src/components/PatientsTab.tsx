import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Activity, UserCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { getPatients, dischargePatient, Patient } from '../lib/api';

interface PatientsTabProps {
  onAdmitClick: () => void;
}

export function PatientsTab({ onAdmitClick }: PatientsTabProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (e: any) {
      toast.error('Failed to load patients', { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDischarge = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to discharge ${name}?`)) return;
    try {
      const res = await dischargePatient(id);
      toast.success(res.message);
      fetchPatients();
    } catch (e: any) {
      toast.error('Discharge failed', { description: e.message });
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div variants={itemVariants} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] rounded-3xl p-8 relative overflow-hidden group min-h-[60vh] flex flex-col">
      <div className="mb-8 relative z-10 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-display font-semibold text-slate-800 dark:text-slate-100 mb-1">Active Patients</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage admissions and discharges</p>
        </div>
        <Button onClick={onAdmitClick} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-full">
          <Plus className="h-4 w-4 mr-2" /> Admit Patient
        </Button>
      </div>

      <div className="relative z-10 w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Age / Gender</th>
              <th className="px-6 py-4">Condition</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Ward / Bed</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">Loading patients...</td></tr>
            ) : patients.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 flex flex-col items-center"><UserCircle2 className="h-10 w-10 mb-2 opacity-50"/>No active patients</td></tr>
            ) : (
              patients.map(p => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">#{p.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{p.name}</td>
                  <td className="px-6 py-4">{p.age} / {p.gender.charAt(0)}</td>
                  <td className="px-6 py-4">{p.condition}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={p.priority === 'critical' ? 'text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20' : p.priority === 'urgent' ? 'text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-900/20' : 'text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20'}>
                      {p.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{p.ward} {p.bed_number ? `/ ${p.bed_number}` : ''}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => handleDischarge(p.id, p.name)} className="rounded-full">
                      Discharge
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
