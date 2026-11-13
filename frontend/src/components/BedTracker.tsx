import React, { useState, useEffect } from 'react';
import { 
  BedDouble, 
  Building2, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Layers, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { HospitalBed, BedStatus, BedCategory } from '../types';
import { HOSPITAL_INFO } from '../services/mockData';
import { useTranslation } from '../utils/translations';

export const BedTracker: React.FC = () => {
  const currentUser = hospitalStore.getUser();
  const [beds, setBeds] = useState<HospitalBed[]>(hospitalStore.getBeds());
  const { t, isHindi } = useTranslation();
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Staff status edit state
  const isStaff = currentUser?.role === 'STAFF_ADMIN';

  useEffect(() => {
    return hospitalStore.subscribe(() => {
      setBeds(hospitalStore.getBeds());
    });
  }, []);

  const handleStatusChange = (bedId: string, newStatus: BedStatus) => {
    hospitalStore.updateBedStatus(bedId, newStatus);
  };

  // Filter beds
  const filteredBeds = beds.filter(bed => {
    const matchCategory = selectedCategory === 'ALL' || bed.bedCategory === selectedCategory;
    const matchFloor = selectedFloor === 'ALL' || String(bed.floor) === selectedFloor;
    const matchStatus = selectedStatus === 'ALL' || bed.status === selectedStatus;
    const matchQuery = !searchQuery || 
      bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bed.wardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bed.building.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchFloor && matchStatus && matchQuery;
  });

  // Summary counts
  const totalBeds = beds.length;
  const availableBeds = beds.filter(b => b.status === 'AVAILABLE').length;
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
  const reservedBeds = beds.filter(b => b.status === 'RESERVED').length;
  const icuAvailable = beds.filter(b => b.bedCategory === 'ICU' && b.status === 'AVAILABLE').length;

  const getStatusBadge = (status: BedStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">{t.common.available}</span>;
      case 'OCCUPIED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">{t.common.occupied}</span>;
      case 'RESERVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">{t.common.reserved} (108)</span>;
      case 'CLEANING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">{isHindi ? 'स्वच्छता' : 'SANITIZATION'}</span>;
      case 'MAINTENANCE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">{isHindi ? 'रखरखाव' : 'MAINTENANCE'}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Minimal Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              {t.bed.badge}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.bed.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {HOSPITAL_INFO.name} • {t.bed.subtitle}
          </p>
        </div>

        {/* Live Redis Sync Badge */}
        <div className="bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200 text-xs self-stretch md:self-auto">
          <div className="flex items-center gap-2 text-slate-800 font-semibold mb-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.bed.redisSync}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {t.bed.redisSyncDesc}
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">{t.bed.totalBeds}</span>
            <BedDouble className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalBeds}</div>
          <span className="text-[11px] text-slate-500">{t.bed.acrossWings}</span>
        </div>

        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span className="font-bold">{t.bed.availableBeds}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{availableBeds}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {t.bed.capacityFree.replace('{pct}', totalBeds > 0 ? ((availableBeds / totalBeds) * 100).toFixed(0) : '0')}
          </span>
        </div>

        <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-200/80 shadow-sm hover:border-rose-300 transition">
          <div className="flex items-center justify-between text-xs text-rose-800 mb-1">
            <span className="font-medium">{t.bed.occupiedBeds}</span>
            <BedDouble className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{occupiedBeds}</div>
          <span className="text-[11px] text-rose-600 font-medium">{t.bed.inpatientAdmissions}</span>
        </div>

        <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/80 shadow-sm hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-xs text-amber-900 mb-1">
            <span className="font-bold">{t.bed.icuBeds}</span>
            <BedDouble className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{icuAvailable} Beds</div>
          <span className="text-[11px] text-amber-700 font-medium">
            {t.bed.ambulanceReserved.replace('{count}', String(reservedBeds))}
          </span>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold">{t.bed.disclaimerTitle}</strong> {t.bed.disclaimerDesc}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {t.bed.wardFilter}
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">{t.bed.allWards}</option>
              <option value="ORTHOPAEDIC">{isHindi ? 'ऑर्थोपेडिक वार्ड' : 'Orthopaedic Ward'}</option>
              <option value="ICU">{isHindi ? 'आईसीयू एवं क्रिटिकल केयर' : 'ICU & Critical Care'}</option>
              <option value="EMERGENCY">{isHindi ? 'आपातकालीन / ट्रॉमा बे' : 'Emergency / Trauma Bay'}</option>
              <option value="GENERAL">{isHindi ? 'जनरल मेडिकल वार्ड' : 'General Medical Ward'}</option>
              <option value="PAEDIATRIC">{isHindi ? 'बाल रोग (पीडियाट्रिक) वार्ड' : 'Paediatric Ward'}</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {t.bed.floorFilter}
            </label>
            <select
              value={selectedFloor}
              onChange={e => setSelectedFloor(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">{t.bed.allFloors}</option>
              <option value="0">{t.bed.groundFloor}</option>
              <option value="1">{t.bed.floor1}</option>
              <option value="2">{t.bed.floor2}</option>
              <option value="3">{t.bed.floor3}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {t.bed.statusFilter}
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">{t.bed.allStatuses}</option>
              <option value="AVAILABLE">{t.common.available}</option>
              <option value="OCCUPIED">{t.common.occupied}</option>
              <option value="RESERVED">{t.common.reserved} (108)</option>
              <option value="CLEANING">{isHindi ? 'स्वच्छता / सैनिटाइजेशन' : 'Sanitization / Cleaning'}</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.bed.searchBed}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

      </div>

      {/* Bed Matrix Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredBeds.map(bed => (
          <div 
            key={bed.id}
            className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-2"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-slate-900">
                  {bed.bedNumber}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{isHindi ? `तल ${bed.floor}` : `Fl ${bed.floor}`}</span>
              </div>

              <div className="text-[11px] font-bold text-slate-700 truncate">
                {bed.wardName}
              </div>

              <div className="text-[10px] text-slate-500 font-medium">
                {bed.bedCategory}
              </div>
            </div>

            <div>
              <div className="mb-1.5">
                {getStatusBadge(bed.status)}
              </div>

              {isStaff ? (
                <select
                  value={bed.status}
                  onChange={e => handleStatusChange(bed.id, e.target.value as BedStatus)}
                  className="w-full text-[10px] font-semibold border border-slate-200 rounded-lg p-1 bg-slate-50 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="AVAILABLE">{t.common.available}</option>
                  <option value="OCCUPIED">{t.common.occupied}</option>
                  <option value="RESERVED">{t.common.reserved}</option>
                  <option value="CLEANING">{isHindi ? 'स्वच्छता' : 'CLEANING'}</option>
                  <option value="MAINTENANCE">{isHindi ? 'रखरखाव' : 'MAINTENANCE'}</option>
                </select>
              ) : (
                <span className="text-[9px] text-slate-400 block truncate">
                  {isHindi ? 'अंतिम अपडेट:' : 'Updated:'} {bed.lastUpdated}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
