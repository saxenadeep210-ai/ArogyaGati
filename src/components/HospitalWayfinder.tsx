import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Clock, 
  ArrowRight, 
  Building2, 
  Footprints,
  Layers,
  Info
} from 'lucide-react';
import { 
  CAMPUS_NAVIGATION_NODES, 
  CAMPUS_NAVIGATION_EDGES, 
  HOSPITAL_INFO 
} from '../services/mockData';
import { NavigationNode } from '../types';

export const HospitalWayfinder: React.FC = () => {
  const nodes = CAMPUS_NAVIGATION_NODES;
  const [sourceNodeId, setSourceNodeId] = useState<string>('NODE-GATE1');
  const [destNodeId, setDestNodeId] = useState<string>('NODE-ORTHO-OPD');
  const [activeFloorView, setActiveFloorView] = useState<number>(2);

  const sourceNode = nodes.find(n => n.id === sourceNodeId) || nodes[0];
  const destNode = nodes.find(n => n.id === destNodeId) || nodes[6];

  // Route calculation
  const directEdge = CAMPUS_NAVIGATION_EDGES.find(
    e => (e.fromNodeId === sourceNodeId && e.toNodeId === destNodeId) ||
         (e.fromNodeId === destNodeId && e.toNodeId === sourceNodeId)
  );

  // Fallback route computation through core elevator/registration
  const totalDistance = directEdge ? directEdge.distanceMeters : 140;
  const walkingMinutes = Math.max(1, Math.ceil(totalDistance / 60));

  const routeInstructions = directEdge ? [directEdge.instructions] : [
    `Start from ${sourceNode.name} (${sourceNode.building}).`,
    `Walk down the main covered patient walkway toward Central Registration Block.`,
    `Take Elevator Core B to Floor ${destNode.floor}.`,
    `Exit elevator and follow the green floor guide tape to ${destNode.name} (${destNode.roomNumber || 'Room'}).`
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
              Indoor GPS & Wayfinding Service
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Hospital Campus & Indoor Navigator
          </h1>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            Turn-by-turn walking guidance from campus gates and registration directly to your doctor's cabin, radiology, ICU, and pharmacy.
          </p>
        </div>

        {/* Floor Level Selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-semibold text-white">Floor View:</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(fl => (
              <button
                key={fl}
                onClick={() => setActiveFloorView(fl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  activeFloorView === fl ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {fl === 0 ? 'G' : `F${fl}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Origin & Destination Selectors */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Start Point */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Current Location / Starting Point:</span>
            </label>
            <select
              value={sourceNodeId}
              onChange={e => setSourceNodeId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.name} — {n.building} (Floor {n.floor})
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-red-600" />
              <span>Destination Room / Department:</span>
            </label>
            <select
              value={destNodeId}
              onChange={e => {
                setDestNodeId(e.target.value);
                const targetNode = nodes.find(n => n.id === e.target.value);
                if (targetNode) setActiveFloorView(targetNode.floor);
              }}
              className="w-full px-3 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-teal-800"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.name} — {n.roomNumber ? `${n.roomNumber}, ` : ''}{n.building}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Route Summary Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
              Calculated Walking Path
            </span>
            <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{sourceNode.name}</span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
              <span className="text-teal-800">{destNode.name}</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Destination: <strong>{destNode.building} → Floor {destNode.floor} → {destNode.roomNumber || 'Reception'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-amber-200 pt-2 sm:pt-0 sm:pl-4">
            <div>
              <span className="text-slate-500 text-[10px] block">Walking Distance:</span>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                <Footprints className="w-4 h-4 text-amber-600" />
                {totalDistance} meters
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Estimated Time:</span>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4 text-teal-600" />
                ~{walkingMinutes} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive SVG Campus & Indoor Blueprint Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SVG Interactive Floor Plan (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Campus Map & Building Layout (Floor {activeFloorView})</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Scale: 1:200</span>
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full h-[420px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
            
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              
              {/* Floor grid guidelines */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />

              {/* Campus Building Zones */}
              {/* Building C: Central OPD Block */}
              <rect x="20" y="45" width="25" height="30" rx="2" fill="rgba(30, 58, 138, 0.4)" stroke="rgba(96, 165, 250, 0.5)" strokeWidth="0.8" />
              <text x="32" y="58" fill="#93c5fd" fontSize="2.8" fontWeight="bold" textAnchor="middle">
                Building C (Central OPD)
              </text>

              {/* Building B: Surgical & Ortho Wing */}
              <rect x="55" y="25" width="30" height="35" rx="2" fill="rgba(15, 118, 110, 0.4)" stroke="rgba(45, 212, 191, 0.5)" strokeWidth="0.8" />
              <text x="70" y="38" fill="#5eead4" fontSize="2.8" fontWeight="bold" textAnchor="middle">
                Building B (Ortho Wing)
              </text>

              {/* Building A: Super Speciality / ICU */}
              <rect x="70" y="10" width="25" height="20" rx="2" fill="rgba(88, 28, 135, 0.4)" stroke="rgba(192, 132, 252, 0.5)" strokeWidth="0.8" />
              <text x="82" y="19" fill="#d8b4fe" fontSize="2.5" fontWeight="bold" textAnchor="middle">
                Block A (Super Speciality)
              </text>

              {/* Emergency Dock */}
              <rect x="35" y="75" width="25" height="18" rx="2" fill="rgba(153, 27, 27, 0.4)" stroke="rgba(248, 113, 113, 0.6)" strokeWidth="0.8" />
              <text x="47" y="85" fill="#fca5a5" fontSize="2.5" fontWeight="bold" textAnchor="middle">
                Emergency 24x7 Trauma
              </text>

              {/* Corridors / Connecting Pathways */}
              <path d="M 10 85 L 35 65 L 50 65 L 68 40 L 75 30" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2,1" className="animate-pulse" />

              {/* Render Navigation Nodes */}
              {nodes.map(n => {
                const isSource = n.id === sourceNodeId;
                const isDest = n.id === destNodeId;

                let nodeColor = '#94a3b8';
                if (isSource) nodeColor = '#10b981'; // Green for Start
                else if (isDest) nodeColor = '#ef4444'; // Red for End
                else if (n.category === 'OPD') nodeColor = '#2dd4bf';
                else if (n.category === 'EMERGENCY') nodeColor = '#f87171';
                else if (n.category === 'ICU') nodeColor = '#c084fc';

                return (
                  <g key={n.id} className="cursor-pointer" onClick={() => setDestNodeId(n.id)}>
                    {/* Outer pulse circle if source or dest */}
                    {(isSource || isDest) && (
                      <circle cx={n.x} cy={n.y} r="4" fill="none" stroke={nodeColor} strokeWidth="0.6" className="animate-ping" opacity="0.6" />
                    )}
                    
                    <circle cx={n.x} cy={n.y} r={isSource || isDest ? "2.5" : "1.8"} fill={nodeColor} stroke="#fff" strokeWidth="0.4" />
                    
                    <text 
                      x={n.x} 
                      y={n.y - 3.5} 
                      fill="#fff" 
                      fontSize="2.2" 
                      fontWeight={isSource || isDest ? "bold" : "normal"}
                      textAnchor="middle"
                      className="drop-shadow-sm select-none"
                    >
                      {isSource ? '🚩 START' : isDest ? '🎯 TARGET' : n.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

            </svg>

            {/* Bottom Floating Legend */}
            <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 flex items-center justify-between text-[11px] text-slate-300">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Start
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Destination
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span> OPD Suites
                </span>
              </div>
              <span className="text-amber-400 font-mono font-bold">Interactive Nodes: Tap node to navigate</span>
            </div>

          </div>
        </div>

        {/* Step-by-Step Instructions Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">
              Turn-by-Turn Route Steps
            </h3>
            <span className="text-xs font-bold text-amber-700 font-mono">
              ~{walkingMinutes} min walk
            </span>
          </div>

          <div className="space-y-3">
            {routeInstructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-1 text-slate-700 leading-relaxed">
                  {step}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-2 mt-4">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Accessibility Assistance:</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Wheelchairs and stretcher escorts are stationed at Main Gate 1 and Central Registration Kiosk. Ask any 'Arogya Mitra' staff for physical transit help.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
