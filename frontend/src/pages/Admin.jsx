import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, AlertTriangle, ShieldCheck, Activity, ShieldAlert, ActivitySquare, Ban, Globe2, Network, MapPin, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!stats) return <div className="min-h-screen flex items-center justify-center text-indigo-500 font-black tracking-widest text-2xl uppercase animate-pulse">Initializing Digital Twin Surveillance...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 font-sans text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute opacity-5 -top-10 -left-10 w-48 h-48 bg-indigo-500 rounded-full blur-3xl"></div>
            <div className="absolute opacity-5 -bottom-10 -right-10 w-48 h-48 bg-rose-500 rounded-full blur-3xl"></div>
            
            <h1 className="text-3xl font-black text-white flex items-center gap-4 tracking-tighter relative z-10">
                <Globe2 className="text-indigo-400 w-12 h-12" />
                <div className="flex flex-col">
                    <span>System Dashboard</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mt-1">GigShield AI v3.0 Core</span>
                </div>
            </h1>
            
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto relative z-10">
                <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-xl flex items-center gap-3 shadow-inner">
                    <Network className="text-emerald-400 w-6 h-6 flex-shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                            System Confidence
                            <Info className="w-3 h-3 text-slate-500 cursor-help" title="Real-time confidence score of automatic decisions" />
                        </span>
                        <span className="font-black text-emerald-400 text-xl">{stats.systemConfidence}%</span>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-xl flex items-center gap-3 shadow-inner">
                    <ShieldCheck className="text-indigo-400 w-6 h-6 flex-shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                            Total Insured Amount
                            <Info className="w-3 h-3 text-slate-500 cursor-help" title="Total money protected by the system today" />
                        </span>
                        <span className="font-black text-indigo-400 text-xl">₹{stats.totalLossPrevented.toFixed(2)}</span>
                    </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition shadow-inner h-full shrink-0"
                >
                  Logout
                </button>
            </div>
        </div>
        
        {/* Top KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-5 relative overflow-hidden group">
            <div className="p-4 bg-slate-800 text-blue-400 rounded-xl shadow-inner border border-slate-700 group-hover:scale-110 transition"><Users className="w-8 h-8"/></div>
            <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    Active Workers
                    <Info className="w-3 h-3 text-slate-600 cursor-help" title="Number of delivery workers currently online" />
                </div>
                <p className="text-4xl font-black text-white tracking-tighter mt-1">{stats.totalUsers}</p>
            </div>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-5 relative overflow-hidden group">
            <div className="p-4 bg-slate-800 text-indigo-400 rounded-xl shadow-inner border border-slate-700 group-hover:scale-110 transition"><FileText className="w-8 h-8"/></div>
            <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    Auto Claims Processed
                    <Info className="w-3 h-3 text-slate-600 cursor-help" title="Number of automatic payouts completed without human review" />
                </div>
                <p className="text-4xl font-black text-white tracking-tighter mt-1">{stats.totalClaims}</p>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-5 relative overflow-hidden group">
            <div className="p-4 bg-slate-800 text-emerald-400 rounded-xl shadow-inner border border-slate-700 group-hover:scale-110 transition"><Activity className="w-8 h-8"/></div>
            <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    Total Payout Amount
                    <Info className="w-3 h-3 text-slate-600 cursor-help" title="Total money paid out automatically" />
                </div>
                <p className="text-3xl font-black text-emerald-400 tracking-tighter mt-1">₹{stats.totalPayouts.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-5 relative overflow-hidden group">
            <div className="p-4 bg-slate-800 text-rose-500 rounded-xl shadow-inner border border-slate-700 group-hover:scale-110 transition"><ShieldAlert className="w-8 h-8"/></div>
            <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    Fraud Attempts Blocked
                    <Info className="w-3 h-3 text-slate-600 cursor-help" title="Number of suspicious claims prevented by the system" />
                </div>
                <p className="text-4xl font-black text-rose-500 tracking-tighter mt-1">{stats.fraudAlerts}</p>
            </div>
          </div>
        </div>

        {/* Massive 2-Column Section layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Digital Twin Vis */}
            <div className="lg:col-span-8 bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 relative">
                <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping mr-1"></div>
                        Live Worker Activity Map
                    </h2>
                    <span className="bg-slate-800 border border-slate-700 px-3 py-1 rounded text-[10px] font-mono tracking-widest uppercase text-slate-400 flex items-center gap-1">
                        Live Updates
                        <Info className="w-3 h-3 text-slate-500 cursor-help" title="Information is streaming in real-time" />
                    </span>
                </div>
                
                {/* CSS Grid for Twin Nodes Mapping */}
                <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 shadow-inner min-h-[400px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                    
                    <div className="relative z-10 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6 w-full max-w-4xl mx-auto opacity-90">
                        {stats.digitalTwinNodes && stats.digitalTwinNodes.map((node) => (
                             <div key={node.id} className="flex flex-col items-center justify-center gap-2 group cursor-crosshair">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-700 relative
                                     ${node.status === 'CRITICAL' ? 'bg-rose-900/50 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] z-10 scale-110' : 
                                       node.status === 'RISK' ? 'bg-amber-900/50 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 
                                       'bg-emerald-900/20 border-emerald-900/50 shadow-inner'}`}>
                                     
                                     {node.status === 'CRITICAL' && <div className="absolute -inset-2 rounded-full border border-rose-500/30 animate-ping"></div>}
                                     <MapPin className={`w-4 h-4 ${node.status === 'CRITICAL' ? 'text-rose-400' : node.status === 'RISK' ? 'text-amber-400' : 'text-emerald-700/50'}`} />
                                 </div>
                                 <span className="text-[8px] font-mono text-slate-500 group-hover:text-white transition">NODE-0{node.id}</span>
                             </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex justify-center gap-8 mt-6">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-900 border border-emerald-700"></div><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Safe</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"></div><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Trending</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]"></div><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Critical Mass</span></div>
                </div>
            </div>

            {/* Fraud & Reinforcement Logs */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                 {/* System Reinforcement Card */}
                 <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 flex-1">
                    <h2 className="text-xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                        <ActivitySquare className="text-indigo-400 w-6 h-6"/> System Learning Status
                        <Info className="w-4 h-4 text-slate-500 cursor-help" title="Current state of the AI's learning process" />
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                                Prediction Accuracy
                                <Info className="w-3 h-3 text-slate-500 cursor-help" title="How accurately the system predicts disruptions" />
                            </span>
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-black text-indigo-400">92.4%</span>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">+1.2% wk</span>
                            </div>
                        </div>
                        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                                System Stability
                                <Info className="w-3 h-3 text-slate-500 cursor-help" title="Current stability of worker patterns and groups" />
                            </span>
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-black text-amber-400">Stable</span>
                                <span className="text-xs font-bold text-slate-400 bg-slate-700 px-2 py-0.5 rounded flex items-center gap-1 cursor-help" title="The system is continuously learning from new data">System Learning Active <Info className="w-3 h-3" /></span>
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 {/* Fraud Engine Card */}
                 <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 flex-1 relative overflow-hidden">
                    <div className="absolute opacity-10 -bottom-10 -right-10"><Ban className="w-48 h-48 text-rose-500" /></div>
                    <h2 className="text-xl font-black text-white mb-6 tracking-tight flex items-center gap-3 z-10 relative">
                        <Ban className="text-rose-500 w-6 h-6"/> Fraud Mitigation Engine
                    </h2>
                    
                    <div className="bg-rose-950/30 border border-rose-900/50 p-6 rounded-xl flex items-center flex-col justify-center h-full min-h-[200px] z-10 relative">
                        {stats.fraudAlerts > 0 ? (
                            <>
                               <p className="text-3xl font-black text-rose-500 text-center">{stats.fraudAlerts} Intrusions<br/>Halted Natively</p>
                               <p className="text-rose-400/80 font-bold mt-4 text-center text-[11px] uppercase tracking-widest">Isolated nodes acting independently of swarm clusters blocked seamlessly.</p>
                            </>
                        ) : (
                            <>
                               <ShieldCheck className="w-16 h-16 text-slate-700 mb-4" />
                               <p className="text-xl font-black text-slate-500">Zero Anomalies Detected</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default Admin;
