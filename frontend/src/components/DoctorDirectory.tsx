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
  ChevronRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { Doctor } from '../types';
import { useTranslation } from '../utils/translations';

interface DoctorDirectoryProps {
  onSelectDoctorForOpd?: (doc: Doctor) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({ onSelectDoctorForOpd }) => {
  const doctors = hospitalStore.getDoctors();
  const departments = hospitalStore.getDepartments();
  const { t, isHindi } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [selectedHierarchy, setSelectedHierarchy] = useState('ALL');
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);

  // Get current day name in English (e.g. "Friday")
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Filtered list
  const filteredDoctors = doctors.filter(doc => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || 
      doc.name.toLowerCase().includes(q) ||
      doc.doctorId.toLowerCase().includes(q) ||
      doc.specialization.toLowerCase().includes(q) ||
      doc.qualification.toLowerCase().includes(q) ||
      doc.departmentName.toLowerCase().includes(q) ||
      doc.roomCabin.toLowerCase().includes(q);
    
    const matchDept = selectedDept === 'ALL' || doc.departmentId === selectedDept;
    const matchDay = selectedDay === 'ALL' || doc.opdDays.includes(selectedDay);
    const matchToday = !availableTodayOnly || doc.opdDays.includes(todayDayName);
    const matchRole = selectedHierarchy === 'ALL' || doc.subRole === selectedHierarchy;

    return matchQuery && matchDept && matchDay && matchToday && matchRole;
  });

  const isFiltered = searchQuery !== '' || selectedDept !== 'ALL' || selectedDay !== 'ALL' || selectedHierarchy !== 'ALL' || availableTodayOnly;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('ALL');
    setSelectedDay('ALL');
    setSelectedHierarchy('ALL');
    setAvailableTodayOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-5">
      
      {/* Clean Minimalist Header (Light White Card) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {t.doctor.badge}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.doctor.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {t.doctor.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs self-start md:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#3435D8] border border-blue-200/80 font-bold">
            {doctors.length} {isHindi ? 'संकाय चिकित्सक' : 'Specialist Faculty'}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            11 {isHindi ? 'विशेष विभाग' : 'Clinical Specialties'}
          </span>
        </div>
      </div>

      {/* Category Filter Pills for Departments */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#3435D8]" />
            <span>{isHindi ? 'चिकित्सा विभाग चुनें' : 'Select Clinical Department'}</span>
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">
            {t.doctor.showingCount.replace('{count}', filteredDoctors.length.toString())}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              selectedDept === 'ALL'
                ? 'bg-[#3435D8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.common.all} ({doctors.length})
          </button>
          {departments.map(dept => {
            const count = doctors.filter(d => d.departmentId === dept.id).length;
            const isSelected = selectedDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#3435D8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{isHindi ? dept.hindiName : dept.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          
          {/* Search by Name or Doctor ID */}
          <div className="relative lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {t.doctor.searchLabel}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.doctor.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3435D8] focus:outline-none"
              />
            </div>
          </div>

          {/* OPD Duty Day Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {t.doctor.dayLabel}
            </label>
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#3435D8]"
            >
              <option value="ALL">{t.doctor.allDays}</option>
              {DAYS_OF_WEEK.map(d => (
                <option key={d} value={d}>
                  {d} {isHindi ? (d === 'Monday' ? '(सोमवार)' : d === 'Tuesday' ? '(मंगलवार)' : d === 'Wednesday' ? '(बुधवार)' : d === 'Thursday' ? '(गुरुवार)' : d === 'Friday' ? '(शुक्रवार)' : '(शनिवार)') : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Hierarchy Level Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {t.doctor.hierarchyLabel}
            </label>
            <select
              value={selectedHierarchy}
              onChange={e => setSelectedHierarchy(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#3435D8]"
            >
              <option value="ALL">{t.doctor.allHierarchy}</option>
              <option value="DIRECTOR">{isHindi ? 'निदेशक एवं प्राचार्य' : 'Director & Principal'}</option>
              <option value="HOD">{isHindi ? 'विभागाध्यक्ष (HOD)' : 'Head of Department (HOD)'}</option>
              <option value="SENIOR_PROFESSOR">{isHindi ? 'वरिष्ठ प्रोफेसर' : 'Senior Professor'}</option>
              <option value="ASSOCIATE_PROFESSOR">{isHindi ? 'एसोसिएट प्रोफेसर' : 'Associate Professor'}</option>
              <option value="ASSISTANT_PROFESSOR">{isHindi ? 'असिस्टेंट प्रोफेसर' : 'Assistant Professor'}</option>
              <option value="JUNIOR_RESIDENT_3">{isHindi ? 'सीनियर रेजिडेंट (JNR-3)' : 'Senior Resident (JNR-3)'}</option>
              <option value="JUNIOR_RESIDENT_2">{isHindi ? 'जूनियर रेजिडेंट (JNR-2)' : 'Junior Resident (JNR-2)'}</option>
              <option value="JUNIOR_RESIDENT_1">{isHindi ? 'जूनियर रेजिडेंट (JNR-1)' : 'Junior Resident (JNR-1)'}</option>
            </select>
          </div>

          {/* Quick Available Today Button & Reset */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setAvailableTodayOnly(!availableTodayOnly)}
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer text-xs ${
                availableTodayOnly 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.doctor.availableToday}</span>
            </button>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-2 px-2.5 rounded-xl font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer flex items-center gap-1"
                title={t.doctor.resetFilters}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredDoctors.map(doc => (
          <div 
            key={doc.id}
            className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Badge: Doctor ID & Status */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
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
              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3435D8] to-teal-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                  {doc.name.split(' ').slice(-1)[0][0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-bold text-[#3435D8] mt-0.5">
                    {doc.designation}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {doc.qualification}
                  </p>
                </div>
              </div>

              {/* Specialization & Department */}
              <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
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
                  <span>{t.doctor.experience}: {doc.yearsOfExperience} {t.doctor.years}</span>
                </div>
              </div>

              {/* OPD Schedule Days & Duty Set */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.doctor.opdDuty}:</span>
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
            <div className="mt-4 pt-3 border-t border-slate-100">
              {doc.isAdministrativeOnly ? (
                <div className="text-center py-2 text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-xl">
                  {t.doctor.adminOnly}
                </div>
              ) : (
                <button
                  onClick={() => onSelectDoctorForOpd?.(doc)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-[#3435D8] text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
                  <span>{t.doctor.bookOpdWithDoctor}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">{isHindi ? 'कोई डॉक्टर नहीं मिला' : 'No doctors match your selected filters'}</h3>
          <p className="text-xs text-slate-500">{isHindi ? 'फ़िल्टर हटाएं या अन्य विभाग चुनें।' : 'Try clearing the search query or switching departments.'}</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#3435D8] text-white rounded-xl text-xs font-bold hover:bg-[#2424B8]"
          >
            {t.doctor.resetFilters}
          </button>
        </div>
      )}

    </div>
  );
};
