
import React, { useState, useEffect, useCallback } from 'react';
import Kiosk from './components/Kiosk';
import NurseDashboard from './components/NurseDashboard';
import { Patient, TriageLevel } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'kiosk' | 'dashboard'>('kiosk');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [queueCount, setQueueCount] = useState(1);

  const handleAddPatient = useCallback((patientData: Partial<Patient>) => {
    const newPatient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      queueNumber: (100 + queueCount).toString(),
      name: patientData.name || 'Anonymous Patient',
      checkInTime: new Date(),
      symptoms: patientData.symptoms || '',
      voiceTranscript: patientData.voiceTranscript,
      drawingData: patientData.drawingData,
      photoData: patientData.photoData,
      triageLevel: patientData.triageLevel || TriageLevel.LEVEL_3,
      status: 'waiting',
      aiSummary: patientData.aiSummary,
      urgencyFlag: patientData.triageLevel === TriageLevel.LEVEL_1 || patientData.triageLevel === TriageLevel.LEVEL_2,
    };

    setPatients(prev => [...prev, newPatient]);
    setQueueCount(prev => prev + 1);
  }, [queueCount]);

  const handleUpdateStatus = (id: string, status: Patient['status']) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleEmergencyAlert = () => {
    // Immediate notification to staff - simulate by adding a critical patient
    handleAddPatient({
      name: "CRITICAL ALERT",
      symptoms: "EMERGENCY BUTTON PRESSED AT KIOSK",
      triageLevel: TriageLevel.LEVEL_1,
      aiSummary: "The patient pressed the emergency panic button. Needs immediate attention.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-xl text-white">
            <i className="fa-solid fa-hospital text-2xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">QuickTriage ER</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">SMART SELF-SERVICE</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setView('kiosk')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === 'kiosk' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <i className="fa-solid fa-tablet-screen-button mr-2"></i> Kiosk View
          </button>
          <button 
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${view === 'dashboard' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <i className="fa-solid fa-user-nurse mr-2"></i> Nurse Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-slate-50">
        {view === 'kiosk' ? (
          <Kiosk 
            onCheckIn={handleAddPatient} 
            onEmergency={handleEmergencyAlert} 
            activeQueueLength={patients.filter(p => p.status === 'waiting').length}
          />
        ) : (
          <NurseDashboard 
            patients={patients} 
            onUpdateStatus={handleUpdateStatus} 
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="bg-white border-t border-slate-200 py-4 px-8 flex justify-between items-center">
        <span className="text-slate-400 text-sm">© 2024 QuickTriage Health Systems</span>
        <div className="flex gap-4">
          <span className="text-slate-400 text-sm flex items-center gap-1">
            <i className="fa-solid fa-circle text-green-500 text-[8px]"></i> System Online
          </span>
          <span className="text-slate-400 text-sm flex items-center gap-1">
            <i className="fa-solid fa-lock text-slate-400 text-[10px]"></i> Data Encrypted
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
