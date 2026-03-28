import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { 
  LayoutDashboard, Users, Activity, MessageSquare, 
  Bed, Stethoscope, AlertTriangle, BrainCircuit, 
  Send, UserCircle2, ChevronLeft, Menu, BarChart3,
  TrendingUp, Database, X, Sparkles, Bell,
  FileText, ClipboardList
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { toast } from 'sonner';
import { getDashboard, getAlerts, DashboardData, Alert } from '@/src/lib/api';
import { PatientsTab } from '@/src/components/PatientsTab';
import { AdmitModal } from '@/src/components/AdmitModal';
import { BedsTab } from '@/src/components/BedsTab';
import { ForecastTab } from '@/src/components/ForecastTab';
import { ReportsTab } from '@/src/components/ReportsTab';
import { StaffTab } from '@/src/components/StaffTab';
import { InsightsTab } from '@/src/components/InsightsTab';
import { HospitalAnalyticsTab } from '@/src/components/HospitalAnalyticsTab';

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdminChatOpen, setIsAdminChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [backendConnected, setBackendConnected] = useState(false);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Fetch dashboard data on mount
  useEffect(() => {
    getDashboard()
      .then(data => { setDashData(data); setBackendConnected(true); })
      .catch(() => setBackendConnected(false));
    getAlerts()
      .then(setAlerts)
      .catch(() => {});
  }, [refreshKey]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(() => setRefreshKey(k => k + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const totalBeds = dashData?.bed_summary?.reduce((a, w) => a + w.total, 0) ?? 0;
  const availBeds = dashData?.bed_summary?.reduce((a, w) => a + w.available, 0) ?? 0;
  const occRate = dashData?.occupancy_rate ?? 0;
  const activePatients = dashData?.patient_stats?.total_active ?? 0;

  const containerVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.1, duration: 0.4 } }
  };
  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'patients', icon: ClipboardList, label: 'Patients' },
    { id: 'beds', icon: Bed, label: 'Bed Map' },
    { id: 'staff', icon: Users, label: 'Staff' },
    { id: 'forecast', icon: TrendingUp, label: 'Forecast' },
    { id: 'insights', icon: BrainCircuit, label: 'AI Insights' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'resources', icon: Database, label: 'Resources' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex overflow-hidden font-sans relative transition-colors duration-500">
      
      {/* Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/15 dark:bg-blue-600/10 blur-[120px] animate-ambient" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-400/15 dark:bg-teal-600/10 blur-[150px] animate-ambient-slow" />
      </div>

      {/* Sidebar */}
      <motion.aside initial={false} animate={{ width: isSidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-r border-white/60 dark:border-slate-800/60 flex flex-col z-20 relative">
        <div className="h-20 flex items-center px-6 border-b border-white/60 dark:border-slate-800/60">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl border border-blue-100"><Activity className="h-6 w-6 text-blue-600" /></div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">HEA</span>
              </motion.div>
            ) : (
              <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                <div className="p-2 bg-blue-50 rounded-xl border border-blue-100"><Activity className="h-6 w-6 text-blue-600" /></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => (
            <motion.button key={item.id} onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
              className={`flex items-center w-full px-3 py-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}>
              <item.icon className={`h-5 w-5 shrink-0 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
              {isSidebarOpen && <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>}
            </motion.button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/60 dark:border-slate-800/60">
          <Button variant="outline" className={`w-full ${!isSidebarOpen && 'px-0 justify-center'}`} asChild>
            <a href="/"><ChevronLeft className={`h-4 w-4 ${isSidebarOpen ? 'mr-2' : ''}`} />{isSidebarOpen && "Logout"}</a>
          </Button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="h-16 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-b border-white/60 dark:border-slate-800/60 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">{navItems.find(i => i.id === activeTab)?.label}</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs ${backendConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
              {backendConnected ? '● Connected' : '○ Disconnected'}
            </Badge>
            <button onClick={() => setIsAdminChatOpen(true)} className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto space-y-8 pb-12">
              
              {activeTab === 'dashboard' && (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: 'Total Beds', value: totalBeds || '--', icon: Bed, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                      { title: 'Available Beds', value: availBeds || '--', icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/30' },
                      { title: 'Occupancy Rate', value: occRate ? `${occRate}%` : '--', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
                      { title: 'Active Patients', value: activePatients || '--', icon: Stethoscope, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
                    ].map((stat, i) => (
                      <motion.div key={i} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }}
                        className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-6 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-10 -mt-10 opacity-40 ${stat.bg}`} />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
                          <div className={`p-2 rounded-xl ${stat.bg}`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                        </div>
                        <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 relative z-10">{stat.value}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Alerts */}
                  {alerts.length > 0 && (
                    <motion.div variants={itemVariants} className="space-y-3">
                      {alerts.map((a, i) => (
                        <div key={i} className={`p-4 rounded-2xl border ${a.level === 'critical' ? 'bg-red-50/80 border-red-200 text-red-700' : 'bg-amber-50/80 border-amber-200 text-amber-700'}`}>
                          {a.level === 'critical' ? '🚨' : '⚠'} {a.message}
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Resources Progress */}
                  {dashData?.resources && dashData.resources.length > 0 && (
                    <motion.div variants={itemVariants} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-6">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Resource Availability</h3>
                      <div className="space-y-4">
                        {dashData.resources.map((r, i) => {
                          const pct = r.total > 0 ? Math.round((r.available / r.total) * 100) : 0;
                          const color = pct <= 20 ? '#dc2626' : pct <= 40 ? '#d97706' : '#059669';
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{r.name}</span>
                                <span style={{ color }}>{r.available}/{r.total}</span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {activeTab === 'patients' && (
                <PatientsTab onAdmitClick={() => setIsAdmitModalOpen(true)} />
              )}

              {activeTab === 'beds' && <BedsTab />}
              {activeTab === 'forecast' && <ForecastTab />}
              {activeTab === 'reports' && <ReportsTab />}

              {activeTab === 'staff' && <StaffTab />}
              {activeTab === 'insights' && <InsightsTab />}

              {activeTab === 'analytics' && <HospitalAnalyticsTab />}

              {activeTab === 'resources' && (
                <motion.div variants={itemVariants} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-8 min-h-[60vh]">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Resource Monitoring</h3>
                  {dashData?.resources && dashData.resources.length > 0 ? (
                    <div className="space-y-4">
                      {dashData.resources.map((r, i) => {
                        const pct = r.total > 0 ? Math.round((r.available / r.total) * 100) : 0;
                        const color = pct <= 20 ? '#dc2626' : pct <= 40 ? '#d97706' : '#059669';
                        return (
                          <div key={i} className="bg-white/50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between mb-2"><span className="font-semibold">{r.name}</span><span className="text-sm" style={{ color }}>{r.available}/{r.total} available</span></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{r.category}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-20">
                      <div className="text-center"><Database className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No resource data</p></div>
                    </div>
                  )}
                </motion.div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Admit Modal */}
      <AdmitModal isOpen={isAdmitModalOpen} onClose={() => setIsAdmitModalOpen(false)} onAdmitted={() => setRefreshKey(k => k + 1)} />

      {/* Chat Sidebar */}
      <AdminChatSidebar isOpen={isAdminChatOpen} onClose={() => setIsAdminChatOpen(false)} dashData={dashData} />
    </div>
  );
}

// ── Admin Chat Sidebar Component ───────────────────
function AdminChatSidebar({ isOpen, onClose, dashData }: { isOpen: boolean; onClose: () => void; dashData: DashboardData | null }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Welcome! I can help with hospital analytics, staff scheduling, and resource optimization.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    const msg = input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setTimeout(() => {
      let reply = "I'm in offline mode. Connect Gemini API for full AI responses.";
      const lower = msg.toLowerCase();
      if (lower.includes('bed') || lower.includes('occupan')) {
        const total = dashData?.bed_summary?.reduce((a, w) => a + w.total, 0) ?? 0;
        const avail = dashData?.bed_summary?.reduce((a, w) => a + w.available, 0) ?? 0;
        reply = `Current bed status: ${total} total beds, ${avail} available. Occupancy rate: ${dashData?.occupancy_rate ?? 0}%.`;
      } else if (lower.includes('patient')) {
        reply = `There are ${dashData?.patient_stats?.total_active ?? 0} active patients, ${dashData?.patient_stats?.urgent ?? 0} urgent, and ${dashData?.patient_stats?.admitted_today ?? 0} admitted today.`;
      } else if (lower.includes('resource') || lower.includes('ventilator') || lower.includes('equipment')) {
        const res = dashData?.resources?.map(r => `${r.name}: ${r.available}/${r.total}`).join(', ') || 'No data';
        reply = `Resources: ${res}`;
      } else if (lower.includes('alert')) {
        reply = dashData?.alerts?.length ? `Active alerts: ${dashData.alerts.map(a => a.message).join('; ')}` : 'No active alerts.';
      } else if (lower.includes('hello') || lower.includes('hi')) {
        reply = "Hello! Ask me about beds, patients, resources, or alerts for quick stats.";
      }
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-slate-950/20 backdrop-blur-[2px] z-[110]" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[380px] bg-white dark:bg-slate-900 shadow-2xl z-[120] border-l border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl"><Sparkles className="h-5 w-5 text-white" /></div>
                <div><h3 className="font-bold">HEA Assistant</h3><p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Admin Support</p></div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'bot' && <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Sparkles className="h-4 w-4 text-blue-600" /></div>}
                  <div className={`rounded-2xl p-3 text-sm max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800">
              <div className="relative">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about beds, patients, resources..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
