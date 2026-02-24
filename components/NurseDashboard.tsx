
import React, { useMemo } from 'react';
import { Patient, TriageLevel } from '../types';

interface NurseDashboardProps {
  patients: Patient[];
  onUpdateStatus: (id: string, status: Patient['status']) => void;
}

const NurseDashboard: React.FC<NurseDashboardProps> = ({ patients, onUpdateStatus }) => {
  // Priority logic: Level 1 & 2 first, then by check-in time
  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      if (a.triageLevel !== b.triageLevel) {
        return a.triageLevel - b.triageLevel;
      }
      return a.checkInTime.getTime() - b.checkInTime.getTime();
    });
  }, [patients]);

  const getTriageColor = (level: TriageLevel) => {
    switch (level) {
      case TriageLevel.LEVEL_1: return 'bg-red-600 text-white';
      case TriageLevel.LEVEL_2: return 'bg-orange-500 text-white';
      case TriageLevel.LEVEL_3: return 'bg-yellow-400 text-slate-900';
      case TriageLevel.LEVEL_4: return 'bg-green-500 text-white';
      case TriageLevel.LEVEL_5: return 'bg-blue-500 text-white';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  const getTriageLabel = (level: TriageLevel) => {
    switch (level) {
      case TriageLevel.LEVEL_1: return 'P1 - CRITICAL';
      case TriageLevel.LEVEL_2: return 'P2 - EMERGENT';
      case TriageLevel.LEVEL_3: return 'P3 - URGENT';
      case TriageLevel.LEVEL_4: return 'P4 - STABLE';
      case TriageLevel.LEVEL_5: return 'P5 - NON-URGENT';
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Patient Queue</h2>
          <p className="text-slate-500">Live monitoring from kiosk self-service.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm text-center">
            <p className="text-xs text-slate-400 font-bold uppercase">Waiting</p>
            <p className="text-2xl font-black text-slate-900">{patients.filter(p => p.status === 'waiting').length}</p>
          </div>
          <div className="bg-red-50 px-6 py-3 rounded-xl border border-red-100 shadow-sm text-center">
            <p className="text-xs text-red-400 font-bold uppercase">Critical (P1/P2)</p>
            <p className="text-2xl font-black text-red-600">{patients.filter(p => p.triageLevel <= 2).length}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 content-start">
        {sortedPatients.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-300">
            <i className="fa-solid fa-hospital-user text-6xl mb-4"></i>
            <p className="text-xl font-bold">No active check-ins</p>
          </div>
        ) : (
          sortedPatients.map((patient) => (
            <div 
              key={patient.id} 
              className={`bg-white rounded-[2rem] border-2 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${patient.urgencyFlag ? 'border-red-200' : 'border-slate-100'}`}
            >
              {/* Header */}
              <div className={`px-6 py-4 flex justify-between items-center ${getTriageColor(patient.triageLevel)}`}>
                <span className="font-black tracking-tighter text-xl">#{patient.queueNumber}</span>
                <span className="text-xs font-bold uppercase tracking-widest">{getTriageLabel(patient.triageLevel)}</span>
              </div>

              {/* Patient Info */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{patient.name}</h3>
                    <p className="text-slate-400 text-sm">Arrived: {patient.checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {patient.photoData && (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden cursor-zoom-in">
                      <img src={patient.photoData} alt="Injury" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="mb-4 flex-1">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-2">AI Summary</p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {patient.aiSummary || patient.symptoms || "No clinical data provided."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  {patient.voiceTranscript && (
                    <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                      <i className="fa-solid fa-microphone"></i> Audio Available
                    </div>
                  )}
                  {patient.drawingData && (
                    <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                      <i className="fa-solid fa-pen-nib"></i> Body Map
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                   {patient.status === 'waiting' ? (
                     <button 
                       onClick={() => onUpdateStatus(patient.id, 'called')}
                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                     >
                       <i className="fa-solid fa-volume-high"></i> Call Patient
                     </button>
                   ) : (
                     <div className="flex-1 bg-green-50 text-green-600 border border-green-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                       <i className="fa-solid fa-circle-check"></i> Patient Notified
                     </div>
                   )}
                   <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-xl transition-colors">
                     <i className="fa-solid fa-ellipsis-vertical"></i>
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NurseDashboard;
