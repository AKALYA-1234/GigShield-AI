import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CloudRain, Sun, ShieldAlert, Activity, AlertTriangle, CheckCircle, MapPin, Zap, Clock, TrendingUp, Compass } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [dynamicPremium, setDynamicPremium] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [simWeather, setSimWeather] = useState('Heavy Rain');
  const [zoneAlerts, setZoneAlerts] = useState(null);
  const [payoutSuccess, setPayoutSuccess] = useState(null);
  const [autoClaimTimer, setAutoClaimTimer] = useState(10);
  const [engineDecision, setEngineDecision] = useState(null);
  
  const timerRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (zoneAlerts && autoClaimTimer > 0) {
      timerRef.current = setTimeout(() => setAutoClaimTimer(prev => prev - 1), 1000);
    } else if (zoneAlerts && autoClaimTimer === 0) {
      processClaim(null, true);
    }
    return () => clearTimeout(timerRef.current);
  }, [zoneAlerts, autoClaimTimer]);

  const fetchData = async () => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (!localUser) return window.location.href = '/login';
    try {
      const res = await axios.get(`http://localhost:5000/api/user/${localUser.id}`);
      setUser(res.data.user);
      setClaims(res.data.claims);
      
      const wRes = await axios.get(`http://localhost:5000/api/weather/${localUser.location}?userId=${localUser.id}`);
      setWeatherData(wRes.data.weather);
      setForecast(wRes.data.forecast);
      setDynamicPremium(wRes.data.dynamicPremium);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 404) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleInactive = async () => {
    await axios.post('http://localhost:5000/api/simulate/toggle', { userId: user.id, inactive: !user.inactive });
    fetchData();
  };

  const simulateWeather = async () => {
    const payload = {
      userId: user.id,
      condition: simWeather,
      rain: simWeather.includes('Rain') ? 15 : 0,
      temp: simWeather.includes('Heat') ? 40 : 25
    };
    try {
      const res = await axios.post('http://localhost:5000/api/simulate/condition', payload);
      setEngineDecision(res.data.evaluation);
      setForecast(res.data.forecast);
      
      if (res.data.zoneSuggestions && res.data.zoneSuggestions.length > 0) {
        setZoneAlerts(res.data.zoneSuggestions);
        setAutoClaimTimer(10); 
      } else {
        processClaim(false, false);
      }
    } catch (e) {
      alert("Error generating simulation");
    }
  };

  const processClaim = async (acceptedZone, isAutoSilent = false) => {
    setZoneAlerts(null);
    clearTimeout(timerRef.current);
    try {
      const payload = {
        userId: user.id,
        lostHours: 2, 
        condition: simWeather,
        acceptedZoneId: acceptedZone ? acceptedZone.id : null,
        expectedPayout: acceptedZone ? acceptedZone.expectedEarnings : 0,
        isAutoSilent
      };
      const res = await axios.post('http://localhost:5000/api/claims/process', payload);
      
      if (res.data.claim || res.data.lossPrevented) {
        setPayoutSuccess(res.data);
        setTimeout(() => setPayoutSuccess(null), 8000);
      }
      fetchData();
    } catch (e) {
      const msg = e.response?.data?.error || "Error processing autonomous claim";
      alert(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Booting Autonomous Engine...</div>;

  const totalProtected = claims.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Welcome, {user.name}</h1>
            <p className="text-slate-500 flex items-center gap-2 mt-1">
              <Compass className="w-4 h-4 text-indigo-500" /> {user.location} | {user.platform} 
              <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100 shadow-sm">Base Risk Score: {user.riskScore}/100</span>
            </p>
          </div>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="text-right border-r pr-6 hidden md:block">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Money Saved</p>
              <p className="text-2xl font-black text-blue-600 mt-1">₹{(user.lossPrevented || 0).toFixed(2)}</p>
            </div>
            <div className="text-right border-r pr-6">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Total Earnings Protected</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">₹{user.wallet.toFixed(2)}</p>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-red-500 font-bold transition">Logout</button>
          </div>
        </div>

        {/* Action / Dev Panel */}
        <div className="bg-slate-900 border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden text-white flex gap-4 items-center flex-wrap">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-24 h-24"/></div>
          <span className="font-extrabold flex items-center gap-2 text-slate-200 z-10 tracking-wide uppercase text-sm">
            <Zap className="w-5 h-5 text-yellow-400" /> System Control:
          </span>
          <button 
            onClick={toggleInactive}
            className={`px-5 py-2 z-10 rounded-lg font-bold shadow-sm transition flex-1 sm:flex-none text-center ${user.inactive ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
          >
             {user.inactive ? 'INACTIVE' : 'ACTIVE'}
          </button>
          
          <div className="flex items-center gap-2 flex-1 sm:flex-none z-10 w-full md:w-auto">
            <select 
              value={simWeather} 
              onChange={e => setSimWeather(e.target.value)}
              className="px-4 py-2 border-none rounded-lg outline-none bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500 w-full font-bold"
            >
              <option>Heavy Rain</option>
              <option>Extreme Heat</option>
              <option>Clear</option>
            </select>
            <button 
              onClick={simulateWeather}
              className="px-6 py-2 bg-indigo-500 font-black rounded-lg w-full md:w-auto hover:bg-indigo-600 transition shadow-md whitespace-nowrap"
            >
              Test Scenario
            </button>
          </div>
          
          {engineDecision && (
              <div className="flex flex-col md:flex-row items-center gap-4 md:ml-auto text-xs font-bold uppercase tracking-wider bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 shadow-inner z-10 w-full md:w-auto">
                  <span className={`${engineDecision.behavior.isBehaviorValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Profile: {engineDecision.behavior.isBehaviorValid ? 'VALID' : 'FLAGGED'}
                  </span>
                  <span className="hidden md:inline text-slate-600">|</span>
                  <span className="text-yellow-400 flex items-center gap-1">
                      Engine Confidence: {Math.round(engineDecision.confidence * 100)}%
                  </span>
              </div>
          )}
        </div>

        {/* Suggestion Alert List */}
        {zoneAlerts && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-8 rounded-2xl shadow-lg relative transform transition-all">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-full shadow-inner border border-amber-200">
                        <Compass className="text-amber-700 w-8 h-8 flex-shrink-0" />
                    </div>
                    <div>
                        <h3 className="font-black text-amber-900 text-2xl tracking-tighter">Autonomous Loss Prevention Triggered</h3>
                        <p className="text-amber-800 font-medium text-sm mt-1">Based on Reinforcement Learning algorithms, select a ranked zone below to preserve income.</p>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-700">Auto-Action</span>
                    <div className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 border border-red-200 shadow-sm rounded-xl font-black text-xl">
                        <Clock className="w-5 h-5 animate-spin"/> {autoClaimTimer}s
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                {zoneAlerts.map((zone, idx) => (
                     <div key={zone.id} className="bg-white border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition cursor-pointer p-5 rounded-xl flex justify-between items-center group shadow-sm" onClick={() => processClaim(zone)}>
                         <div>
                             <h4 className="font-black text-slate-800 text-lg flex items-center gap-2 tracking-tight">
                                <span className={`px-2 py-0.5 rounded text-[10px] text-white ${idx === 0 ? 'bg-indigo-600' : 'bg-slate-400'}`}>Rank #{idx+1}</span>
                                <span className="group-hover:text-amber-700 transition">{zone.name}</span>
                             </h4>
                             <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wider">
                                Success Rate: <span className="text-emerald-600">{zone.successRate}%</span> | Weather: {zone.weatherStatus}
                             </p>
                         </div>
                         <div className="text-right">
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Expected Gain</p>
                             <p className="text-2xl font-black text-emerald-600 drop-shadow-sm">₹{zone.expectedEarnings}</p>
                         </div>
                     </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={() => processClaim(null, false)} className="text-amber-700 hover:text-amber-900 font-bold underline px-4 py-2 hover:bg-amber-100 rounded-lg transition">Ignore & Proceed to Payout</button>
            </div>
          </div>
        )}

        {/* Payout Success Alert */}
        {payoutSuccess && payoutSuccess.claim && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-8 rounded-2xl shadow-xl flex items-center justify-between transform transition-all duration-500 animate-in zoom-in-95">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner border border-emerald-200">
                <CheckCircle className="text-emerald-600 w-10 h-10 drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-black text-emerald-900 text-2xl tracking-tighter">
                    {payoutSuccess.isAutoSilent ? "Autonomous Execution Complete" : "Context-Aware Payout Triggered"}
                </h3>
                <p className="text-emerald-800 mt-2 font-bold bg-white px-3 py-1 rounded-md inline-block shadow-sm text-sm border border-emerald-100 hover:shadow transition">
                    System applied a Context Confidence Multiplier of <span className="font-black text-indigo-700">{(payoutSuccess.confidence * 100).toFixed(0)}%</span> to your payout.
                </p>
              </div>
            </div>
            <div className="bg-white px-6 py-4 rounded-xl shadow-xl border-2 border-emerald-100 transform scale-110">
               <span className="text-emerald-600 font-black text-4xl drop-shadow-sm">+₹{payoutSuccess.claim.amount.toFixed(2)}</span>
            </div>
          </div>
        )}
        
        {payoutSuccess && payoutSuccess.lossPrevented && (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 p-8 rounded-2xl shadow-xl flex items-center justify-between animate-in zoom-in-95">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center shadow-inner text-indigo-600 font-bold text-3xl border border-indigo-200">🛡️</div>
                <div>
                  <h3 className="font-black text-indigo-900 text-2xl tracking-tighter">Reward Engine Applied</h3>
                  <p className="text-indigo-800 mt-1 font-medium bg-white px-3 py-1 rounded-md inline-block shadow-sm text-sm border border-indigo-100">
                      Recommendation accepted. Simulated income protected: <span className="text-indigo-700 font-black">₹{payoutSuccess.lossPrevented.toFixed(2)}</span>.
                  </p>
                </div>
             </div>
          </div>
        )}

        {/* Dashboard 3-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Adaptive Engine Card */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:border-indigo-200 transition duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-50 p-2.5 rounded-lg"><TrendingUp className="w-6 h-6 text-indigo-600" /></div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Your Insurance Plan</h2>
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-500 font-bold text-xs tracking-wide uppercase">Weekly Cost</span>
                <span className="font-black text-indigo-600 text-2xl">₹{dynamicPremium.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-500 font-bold text-xs tracking-wide uppercase">Current Risk Level</span>
                <span className={`font-black uppercase tracking-wider px-3 py-1 rounded text-[10px] ${user.riskTier === 'High' ? 'bg-rose-100 text-rose-700' : user.riskTier === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {user.riskTier}
                </span>
              </div>
              <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-bold text-xs uppercase tracking-widest">Covered Amount</span>
                    <span className="font-black text-xl text-emerald-500 border-b-2 border-emerald-200">₹{totalProtected.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Predictive Forecasting Card */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:border-blue-200 transition duration-300">
             <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2.5 rounded-lg"><CloudRain className="w-6 h-6 text-blue-600" /></div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Upcoming Risk Prediction</h2>
              </div>
            </div>
            
            {forecast ? (
              <div className="space-y-4">
                 <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl mb-4 shadow-sm">
                     <p className="text-rose-600 font-bold text-xs uppercase tracking-widest text-center">{forecast.alertMessage === 'Weather Conditions Remain Stable' ? 'No Risk Expected Soon' : forecast.alertMessage}</p>
                 </div>
                 
                 <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                    {forecast.timeline.map((point, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <span className="text-[10px] items-center text-center font-black text-slate-500 uppercase tracking-widest w-16 leading-tight">Next {point.hourOffset} Hour{point.hourOffset > 1 ? 's' : ''}</span>
                            <div className="w-8 h-20 bg-slate-100 rounded-full border border-slate-200 overflow-hidden relative shadow-inner">
                                <div className="absolute bottom-0 w-full rounded-full transition-all duration-1000 bg-gradient-to-t from-indigo-500 to-indigo-300" style={{ height: `${Math.round(point.disruptionProbability)}%` }}></div>
                            </div>
                            <span className="text-xs font-black text-slate-700">{point.disruptionProbability.toFixed(2)}%</span>
                        </div>
                    ))}
                 </div>
                 <div className="flex justify-between items-center pt-2">
                     <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Possible Income Loss</span>
                     <span className="font-black text-xl text-rose-500">₹{forecast.expectedLoss.toFixed(2)}</span>
                 </div>
              </div>
            ) : <p className="text-slate-400 text-center mt-6 font-bold uppercase tracking-widest text-sm animate-pulse">Running Neural Models...</p>}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:border-slate-300 transition duration-300 flex flex-col h-[400px]">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3 tracking-tight">
              <div className="bg-slate-100 p-2.5 rounded-lg"><Activity className="w-6 h-6 text-slate-600" /></div>
              Your Payment History
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {claims.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                  <span className="text-5xl mb-3 drop-shadow-sm">📄</span>
                  <p className="font-extrabold relative -top-2 tracking-tight text-lg">Zero Claims Filed</p>
                </div>
              ) : (
                claims.slice().reverse().map((c, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50 hover:bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition">
                    <div>
                      <p className="font-black text-slate-800 tracking-tight">{c.reason}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${c.status.includes('Auto') ? 'text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded inline-block' : 'text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded inline-block'}`}>
                        {c.status.includes('PAID (CONF:') ? c.status.replace('PAID (CONF: ', 'Paid Successfully (').replace('%)', '% Sure)') : c.status}
                      </p>
                    </div>
                    <span className="font-black text-xl text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">+₹{c.amount.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
