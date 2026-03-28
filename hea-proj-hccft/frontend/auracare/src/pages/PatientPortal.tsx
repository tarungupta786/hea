import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { 
  Building2, Activity, HeartPulse, ArrowRight, 
  AlertCircle, CheckCircle2, ShieldCheck, MapPin,
  LogOut, FileText, MessageSquare, Send, X, Sparkles, Bed,
  Phone, Star, Ambulance, Clock, Navigation, Search, SlidersHorizontal,
  Map as MapIcon, LocateFixed
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { toast } from 'sonner';
import { getBedSummary, admitPatient, getNearbyHospitals, BedSummary, NearbyHospital } from '@/src/lib/api';
import { HospitalMap } from '../components/HospitalMap';

export default function PatientPortal() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string; text: string}[]>([
    { role: 'bot', text: "Hello! I'm Aura, your AI health assistant. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [hospitals, setHospitals] = useState<BedSummary[]>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<NearbyHospital[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const [bookingDone, setBookingDone] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  
  // New Map State
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);

  useEffect(() => {
    getBedSummary().then(setHospitals).catch(() => {});
    getNearbyHospitals()
      .then(setNearbyHospitals)
      .catch(() => {})
      .finally(() => setLoadingNearby(false));
      
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Location access denied")
      );
    }
  }, []);

  // Filtered Hospitals
  const filteredHospitals = useMemo(() => {
    return nearbyHospitals.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRadius = h.distance_km <= radiusKm;
      return matchesSearch && matchesRadius;
    });
  }, [nearbyHospitals, searchQuery, radiusKm]);

  // Emergency Booking submit
  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const name = fd.get('patient_name') as string;
    const symptoms = fd.get('symptoms') as string;
    const priority = fd.get('priority') as string;
    if (!name || !symptoms || !priority) { toast.error('Please fill all fields'); return; }
    const priorityMap: Record<string, string> = { low: 'normal', medium: 'urgent', high: 'critical' };
    try {
      const res = await admitPatient({ name, age: 0, gender: 'other', condition: symptoms, priority: priorityMap[priority] || 'normal', ward: priority === 'high' ? 'Emergency' : undefined });
      setBookingResult(res); setBookingDone(true);
      toast.success(res.message);
      getBedSummary().then(setHospitals).catch(() => {});
    } catch (err: any) { toast.error('Booking failed', { description: err.message }); }
  };

  const handleChatSend = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setTimeout(() => {
      let reply = "I'm in offline mode. Connect Gemini API for AI-powered responses.";
      const lower = msg.toLowerCase();
      if (lower.includes('bed') || lower.includes('availability')) {
        const total = hospitals.reduce((a, h) => a + h.available, 0);
        reply = `There are currently ${total} beds available across all wards. Go to "Nearby Hospitals" section to see per-hospital availability.`;
      } else if (lower.includes('hospital') || lower.includes('nearby')) {
        reply = `There are ${nearbyHospitals.length} hospitals near you. The closest is ${nearbyHospitals[0]?.name} (${nearbyHospitals[0]?.distance_km} km away) with ${nearbyHospitals[0]?.available_beds} beds available.`;
      }
      setChatMessages(prev => [...prev, { role: 'bot', text: reply }]);
    }, 800);
  };

  const containerVariants: any = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
  const itemVariants: any = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } } };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-400/10 dark:bg-blue-900/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-400/10 dark:bg-teal-900/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/40 dark:border-slate-800/60 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-blue-600">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800/50"><HeartPulse className="h-7 w-7" /></div>
            <span className="text-2xl font-display font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">HEA</span>
          </motion.div>
          <motion.nav initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 items-center">
            <ThemeToggle />
            <Button variant="ghost" className="rounded-full px-5">My Records</Button>
            <Button onClick={() => { sessionStorage.removeItem('hea_auth'); navigate('/login'); }} variant="outline" className="rounded-full px-5 flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </motion.nav>
        </div>
      </header>

      <main className="relative z-10 pt-20">
        <div className="max-w-[1600px] mx-auto px-6 space-y-20 pb-24">
          
          {/* Hero */}
          <motion.section initial="hidden" animate="visible" variants={containerVariants}
            className="text-center pt-24 pb-12 flex flex-col items-center justify-center max-w-4xl mx-auto">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
              <ShieldCheck className="h-4 w-4" /> AI-Powered Healthcare
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-display font-extrabold text-slate-800 dark:text-slate-100 tracking-tighter leading-[0.9] mb-8">
              Smart Care, <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">When You Need It</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              Connect to the right hospital instantly, get AI-driven health insights, and book emergencies seamlessly.
            </motion.p>
            <motion.div variants={itemVariants} className="flex gap-4">
              <Button size="lg" onClick={() => document.getElementById('emergency-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full h-14 px-8 text-lg font-bold shadow-xl shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-blue-500">
                Emergency Booking
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('hospitals-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full h-14 px-8 text-lg font-bold border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                View Nearby Hospitals
              </Button>
            </motion.div>
          </motion.section>

          {/* Nearby Hospitals — DUAL PANE ─────────────────────── */}
          <motion.section id="hospitals-section" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-4xl font-display font-bold text-slate-800 dark:text-slate-100 mb-2">Nearby Hospitals</h2>
                <p className="text-slate-500 dark:text-slate-400">{filteredHospitals.length} healthcare facilities within {radiusKm} km</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full gap-2 border-slate-200 dark:border-slate-800">
                  <SlidersHorizontal className="h-4 w-4" /> Filter
                </Button>
                <Button variant="outline" className="rounded-full gap-2 border-slate-200 dark:border-slate-800" onClick={() => navigate(0)}>
                  <Clock className="h-4 w-4" /> Refresh
                </Button>
              </div>
            </div>

            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 rounded-[2.5rem] overflow-hidden shadow-2xl flex h-[800px]">
              
              {/* Left Sidebar: List & Controls */}
              <div className="w-[450px] flex flex-col border-r border-white/40 dark:border-slate-800/60">
                <div className="p-8 space-y-6 bg-white/40 dark:bg-slate-950/20">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search hospital or specialty..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-14 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                  </div>
                  
                  {/* Radius Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-500 uppercase tracking-tighter">Search Radius</span>
                      <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">{radiusKm} km</span>
                    </div>
                    <input 
                      type="range" min="1" max="50" step="1" 
                      value={radiusKm} 
                      onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      <span>1 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </div>

                {/* Hospital List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {loadingNearby ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-slate-400 font-medium">Finding nearby facilities...</p>
                    </div>
                  ) : filteredHospitals.length === 0 ? (
                    <div className="py-20 text-center px-8">
                      <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4 opacity-50" />
                      <h4 className="text-lg font-bold text-slate-400 mb-2">No hospitals found</h4>
                      <p className="text-sm text-slate-400">Try expanding your search radius or clearing the search query.</p>
                      <Button variant="link" className="text-blue-600 mt-4" onClick={() => { setSearchQuery(''); setRadiusKm(50); }}>Reset Filters</Button>
                    </div>
                  ) : (
                    filteredHospitals.map((h) => (
                      <motion.div 
                        key={h.id}
                        layoutId={`hosp-${h.id}`}
                        onClick={() => setSelectedHospitalId(h.id)}
                        className={`group cursor-pointer p-5 rounded-3xl border transition-all duration-300 ${
                          selectedHospitalId === h.id 
                            ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-500/30' 
                            : 'bg-white/60 dark:bg-slate-800/40 border-white/40 dark:border-slate-700/40 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:y-[-2px]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-lg mb-1 truncate ${selectedHospitalId === h.id ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                              {h.name}
                            </h3>
                            <div className={`flex items-center gap-2 text-sm mb-3 ${selectedHospitalId === h.id ? 'text-blue-100' : 'text-slate-500'}`}>
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">{h.address}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`text-sm font-black italic ${selectedHospitalId === h.id ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                              {h.distance_km} km
                            </span>
                            <div className="flex items-center gap-1 font-bold text-amber-400">
                              <Star className="h-3 w-3 fill-amber-400" />
                              <span className="text-[10px]">{h.rating}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bed Stats */}
                        <div className="flex gap-2 mt-4">
                          <Badge className={`${selectedHospitalId === h.id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'}`}>
                            {h.available_beds} Beds Free
                          </Badge>
                          <Badge className={`${selectedHospitalId === h.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'}`}>
                            {h.type}
                          </Badge>
                        </div>
                        
                        <div className="mt-5 pt-5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                           <div className="flex gap-1">
                             {h.has_ambulance === 1 && <Ambulance className={`h-4 w-4 ${selectedHospitalId === h.id ? 'text-white/60' : 'text-slate-400'}`} />}
                             {h.is_open_24h === 1 && <Clock className={`h-4 w-4 ${selectedHospitalId === h.id ? 'text-white/60' : 'text-slate-400'}`} />}
                           </div>
                           <Button variant="ghost" size="sm" className={`rounded-full h-8 gap-2 ${selectedHospitalId === h.id ? 'text-white hover:bg-white/10' : 'text-blue-600'}`}>
                             Details <ArrowRight className="h-3 w-3" />
                           </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Right: Map View */}
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                <HospitalMap 
                  hospitals={filteredHospitals} 
                  selectedId={selectedHospitalId}
                  onSelect={setSelectedHospitalId}
                  userLocation={userLocation}
                />
                
                {/* Locate Me Overlay */}
                <Button size="icon" onClick={() => setUserLocation(userLocation)}
                  className="absolute bottom-10 right-10 w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 text-blue-600 shadow-2xl hover:scale-110 active:scale-95 transition-all">
                  <LocateFixed className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </motion.section>

          {/* Emergency Booking Section */}
          <motion.section id="emergency-section" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
             {/* ... (Existing Emergency booking form logic remains same) ... */}
             <div className="max-w-xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-red-100 dark:border-red-900/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
                <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-slate-900 p-10">
                  <h3 className="text-3xl font-display font-bold text-red-600 dark:text-red-400 flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl"><AlertCircle className="h-7 w-7" /></div>
                    Emergency Booking
                  </h3>
                  <p className="text-slate-500 font-medium">Request immediate medical attention. Our AI will route you to the nearest hospital with available beds.</p>
                </div>
                {bookingDone ? (
                  <div className="p-10 text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Booking Confirmed</h3>
                    <p className="text-slate-500 mb-6">{bookingResult?.message}</p>
                    <Button onClick={() => setBookingDone(false)} variant="outline" className="rounded-full w-full h-12">Book Another</Button>
                  </div>
                ) : (
                  <form className="p-10 space-y-8" onSubmit={handleEmergencySubmit}>
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Patient Name</label>
                      <input type="text" name="patient_name" required placeholder="Full Name" className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 transition-all focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Current Symptoms</label>
                      <textarea name="symptoms" rows={3} required placeholder="Describe condition..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 transition-all focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button type="submit" size="lg" className="col-span-2 h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-xl shadow-red-500/20">
                         Request Emergency Assistance
                      </Button>
                    </div>
                  </form>
                )}
             </div>
          </motion.section>
        </div>

        {/* Floating AI Assistant (Simplified) */}
        <div className="fixed bottom-10 right-10 z-[100]">
           <Button className="w-16 h-16 rounded-full bg-blue-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center">
              <MessageSquare className="h-8 w-8" />
           </Button>
        </div>
      </main>
    </div>
  );
}
