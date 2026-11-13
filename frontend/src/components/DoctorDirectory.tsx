import React, { useState } from 'react';
import { 
  Stethoscope, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  UserCheck,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { Doctor } from '../types';

interface DoctorDirectoryProps {
  onSelectDoctorForOpd?: (doc: Doctor) => void;
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({ onSelectDoctorForOpd }) => {
  const doctors = hospitalStore.getDoctors();
  const departments = hospitalStore.getDepartments();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [selectedHierarchy, setSelectedHierarchy] = useState('ALL');

  // Filtered list
  const filteredDoctors = doctors.filter(doc => {
    const matchQuery = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.doctorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchDept = selectedDept === 'ALL' || doc.departmentId === selectedDept;
    const matchDay = selectedDay === 'ALL' || doc.opdDays.includes(selectedDay);
    const matchRole = selectedHierarchy === 'ALL' || doc.subRole === selectedHierarchy;

    return matchQuery && matchDept && matchDay && matchRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">
              Faculty & Clinical Specialists Directory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Hospital Medical Hierarchy & OPD Duty Sets
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            S. N. Medical College, Agra • Explore specialized medical faculty from Director and HODs down to Associate Professors, Assistant Professors, and Junior Residents.
          </p>
        </div>

        {/* Blueprint Hierarchy Flow Summary */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-xs max-w-xs hidden lg:block">
          <span className="text-teal-300 font-bold block mb-1">Blueprint Organizational Tree:</span>
          <p className="text-[11px] text-blue-100">
            Director → Department HOD → Senior Professors → Associate Professors → Assistant Professors → Junior Residents (JNR 1/2/3).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Search by Name or Doctor ID */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search by Doctor Name or ID
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="e.g. Mehta or DOC-ORTHO..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Departments (11 Categories)</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* OPD Day Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              OPD Duty Day
            </label>
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Days (Monday to Saturday)</option>
              <option value="Monday">Monday (Set A)</option>
              <option value="Tuesday">Tuesday (Set B)</option>
              <option value="Wednesday">Wednesday (Set C)</option>
              <option value="Thursday">Thursday (Set A)</option>
              <option value="Friday">Friday (Set B)</option>
              <option value="Saturday">Saturday (Set C)</option>
            </select>
          </div>

          {/* Hierarchy Level Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Designation Level
            </label>
            <select
              value={selectedHierarchy}
              onChange={e => setSelectedHierarchy(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Hierarchy Levels</option>
              <option value="DIRECTOR">Director & Principal</option>
              <option value="HOD">Head of Department (HOD)</option>
              <option value="ASSOCIATE_PROFESSOR">Associate Professor</option>
              <option value="ASSISTANT_PROFESSOR">Assistant Professor</option>
              <option value="JUNIOR_RESIDENT_3">Senior Resident (JNR-3)</option>
              <option value="JUNIOR_RESIDENT_2">Junior Resident (JNR-2)</option>
              <option value="JUNIOR_RESIDENT_1">Junior Resident (JNR-1)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doc => (
          <div 
            key={doc.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-400 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Badge: Doctor ID & Status */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-black text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {doc.doctorId}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  doc.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                  doc.status === 'IN_CONSULTATION' ? 'bg-blue-100 text-blue-800' :
                  doc.status === 'ON_ROUND' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {doc.status.replace('_', ' ')}
                </span>
              </div>

              {/* Doctor Details */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-teal-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                  {doc.name.split(' ').slice(-1)[0][0]}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-bold text-teal-700 mt-0.5">
                    {doc.designation}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {doc.qualification}
                  </p>
                </div>
              </div>

              {/* Specialization & Department */}
              <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 font-medium">
                  <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-slate-800 font-semibold">{doc.specialization}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{doc.roomCabin} • {doc.building} (Floor {doc.floor})</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Experience: {doc.yearsOfExperience} Years</span>
                </div>
              </div>

              {/* OPD Schedule Days & Duty Set */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OPD Duty:</span>
                  <span className="font-bold text-slate-800 text-[11px]">
                    {doc.opdDays.join(', ')}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                  {doc.doctorSet}
                </span>
              </div>
            </div>

            {/* Bottom Consultation Booking Action */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              {doc.isAdministrativeOnly ? (
                <div className="text-center py-2 text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-xl">
                  Administrative Head (Non-OPD Role)
                </div>
              ) : (
                <button
                  onClick={() => onSelectDoctorForOpd?.(doc)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-teal-700 text-white shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
                  <span>Book OPD Token with Doctor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
