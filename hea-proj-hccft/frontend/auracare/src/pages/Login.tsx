import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse, UserCircle2, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/src/components/ThemeToggle';

export default function Login() {
  const [role, setRole] = useState<'patient' | 'admin'>('patient');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem('hea_auth', 'patient');
    toast.success('Welcome!', { description: 'Logged in as Patient.' });
    navigate('/patient');
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const username = (formData.get('admin_email') as string)?.trim();
    const password = (formData.get('admin_password') as string)?.trim();

    // Validate against known admin credentials
    if (username === 'admin' && password === 'admin123') {
      sessionStorage.setItem('hea_auth', 'admin');
      toast.success('Welcome, Admin!', { description: 'Logged in successfully.' });
      navigate('/admin');
    } else {
      toast.error('Invalid credentials', { description: 'Use admin / admin123' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-300">
      {/* Theme Toggle in Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Aesthetic Background Gradients */}
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-300/20 dark:bg-blue-900/20 blur-[120px] pointer-events-none animate-ambient" />
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-teal-300/20 dark:bg-teal-900/20 blur-[120px] pointer-events-none animate-ambient-slow" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[40vw] rounded-full bg-indigo-300/10 dark:bg-indigo-900/10 blur-[120px] pointer-events-none animate-ambient-fast" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
      >
        {/* Left Side: Branding */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-3xl font-display font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
              HEA
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="text-4xl lg:text-5xl font-display font-bold text-slate-800 dark:text-slate-100 leading-tight mb-6"
          >
            Welcome to the future of healthcare.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="text-lg text-slate-600 dark:text-slate-400 mb-10"
          >
            AI-powered hospital management system. Please select your role to continue.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5 }}
            className="flex gap-4"
          >
            <button 
              onClick={() => setRole('patient')}
              className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                role === 'patient' 
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10' 
                  : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/30'
              }`}
            >
              <HeartPulse className={`h-6 w-6 ${role === 'patient' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className={`font-medium ${role === 'patient' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>Patient</span>
            </button>
            <button 
              onClick={() => setRole('admin')}
              className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                role === 'admin' 
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 shadow-md shadow-teal-500/10' 
                  : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:border-teal-200 dark:hover:border-teal-800 hover:bg-teal-50/30 dark:hover:bg-teal-900/30'
              }`}
            >
              <ShieldCheck className={`h-6 w-6 ${role === 'admin' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className={`font-medium ${role === 'admin' ? 'text-teal-700 dark:text-teal-300' : 'text-slate-600 dark:text-slate-400'}`}>Staff / Admin</span>
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.6 }}
            className="mt-12 p-6 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 backdrop-blur-md"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                <Building2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">For Hospitals</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Join our network and manage your facility efficiently.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/register-hospital')}
              className="w-full py-3 px-6 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Register Your Hospital <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex items-center justify-center p-4">
          <motion.div 
            key={role}
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-3xl p-8 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${role === 'patient' ? 'from-blue-500 to-blue-400' : 'from-teal-500 to-teal-400'}`} />
            
            <div className="mb-8 text-center">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${role === 'patient' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'}`}>
                {role === 'patient' ? <UserCircle2 className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">
                {role === 'patient' ? 'Patient Portal' : 'Staff Access'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {role === 'patient' ? 'Access your health records and bookings' : 'Default: admin / admin123'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {role === 'patient' ? (
                <motion.form 
                  key="patient-form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={handlePatientLogin} 
                  className="space-y-5"
                >
                  <div className="relative z-0 w-full group/input">
                    <input type="text" id="patient_email" name="patient_email" required className="block py-3 px-0 w-full text-base text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer transition-colors" placeholder=" " />
                    <label htmlFor="patient_email" className="peer-focus:font-medium absolute text-base text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email or Phone Number</label>
                  </div>
                  <div className="relative z-0 w-full group/input">
                    <input type="password" id="patient_password" name="patient_password" required className="block py-3 px-0 w-full text-base text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer transition-colors" placeholder=" " />
                    <label htmlFor="patient_password" className="peer-focus:font-medium absolute text-base text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Sign In <ArrowRight className="h-4 w-4" />
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => { sessionStorage.setItem('hea_auth','patient'); navigate('/patient'); }}
                    className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" /> Emergency Access
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form 
                  key="admin-form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={handleAdminLogin} 
                  className="space-y-5"
                >
                  <div className="relative z-0 w-full group/input">
                    <input type="text" id="admin_email" name="admin_email" required className="block py-3 px-0 w-full text-base text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 appearance-none focus:outline-none focus:ring-0 focus:border-teal-500 peer transition-colors" placeholder=" " />
                    <label htmlFor="admin_email" className="peer-focus:font-medium absolute text-base text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-teal-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Username (admin)</label>
                  </div>
                  <div className="relative z-0 w-full group/input">
                    <input type="password" id="admin_password" name="admin_password" required className="block py-3 px-0 w-full text-base text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 appearance-none focus:outline-none focus:ring-0 focus:border-teal-500 peer transition-colors" placeholder=" " />
                    <label htmlFor="admin_password" className="peer-focus:font-medium absolute text-base text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-teal-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password (admin123)</label>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? 'Signing in…' : (<>Secure Login <ArrowRight className="h-4 w-4" /></>)}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
