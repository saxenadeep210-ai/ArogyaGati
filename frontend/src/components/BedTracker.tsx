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

export const BedTracker: React.FC = () => {
  const currentUser = hospitalStore.getUser();
  const [beds, setBeds] = useState<HospitalBed[]>(hospitalStore.getBeds());
  
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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">AVAILABLE</span>;
      case 'OCCUPIED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">OCCUPIED</span>;
      case 'RESERVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">RESERVED (108)</span>;
      case 'CLEANING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">SANITIZATION</span>;
      case 'MAINTENANCE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">MAINTENANCE</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-300 animate-ping"></span>
            <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">
              Central Bed Inventory & Resource Tracker
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Available Hospital Bed Matrix
          </h1>
          <p className="text-xs text-teal-100 mt-1 max-w-xl">
            {HOSPITAL_INFO.name} • Transparent real-time ward, ICU, and emergency bed occupancy.
          </p>
        </div>

        {/* Live Redis Sync Badge */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs">
          <div className="flex items-center gap-2 text-teal-200 font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>Redis Cache Active</span>
          </div>
          <p className="text-[11px] text-teal-100">
            Updated via WebSocket broadcast every 10 seconds.
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Total Beds Configured</span>
            <BedDouble className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalBeds}</div>
          <span className="text-[10px] text-slate-400">Across 6 Hospital Wings</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span className="font-bold">Available Beds</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{availableBeds}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">{((availableBeds / totalBeds) * 100).toFixed(0)}% Capacity Free</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm bg-gradient-to-br from-white to-rose-50/40">
          <div className="flex items-center justify-between text-xs text-rose-800 mb-1">
            <span className="font-medium">Occupied Beds</span>
            <BedDouble className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{occupiedBeds}</div>
          <span className="text-[10px] text-rose-500 font-medium">Inpatient Admissions</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between text-xs text-amber-900 mb-1">
            <span className="font-bold">ICU / Ventilator Free</span>
            <BedDouble className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{icuAvailable} Beds</div>
          <span className="text-[10px] text-amber-600 font-medium">{reservedBeds} Ambulance Reserved</span>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer (Section 12 Requirement) */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Citizen Information:</strong> Real-time bed occupancy displayed here reflects current ward inventory at S. N. Medical College, Agra. Final bed reservation and clinical admission remain strictly subject to confirmation by the attending hospital triage team based on medical severity.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Bed Category
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Categories (सभी वार्ड)</option>
              <option value="ORTHOPAEDIC">Orthopaedic Ward</option>
              <option value="ICU">ICU & Critical Care</option>
              <option value="EMERGENCY">Emergency / Trauma Bay</option>
              <option value="GENERAL">General Medical Ward</option>
              <option value="PAEDIATRIC">Paediatric Ward</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Floor Level
            </label>
            <select
              value={selectedFloor}
              onChange={e => setSelectedFloor(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Floors</option>
              <option value="0">Ground Floor (Casualty/Trauma)</option>
              <option value="1">Floor 1 (General Ward & Surgery)</option>
              <option value="2">Floor 2 (Orthopaedics)</option>
              <option value="3">Floor 3 (ICU & Super Speciality)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Occupancy Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available Only</option>
              <option value="OCCUPIED">Occupied Only</option>
              <option value="RESERVED">Ambulance Reserved</option>
              <option value="CLEANING">Sanitization / Cleaning</option>
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
            placeholder="Search bed, ward, building..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs"
          />
        </div>

      </div>

      {/* Bed Grid (Section 12 Hierarchy: Hospital -> Building -> Floor -> Ward -> Bed Number) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map(bed => {
          const isAvail = bed.status === 'AVAILABLE';
          return (
            <div 
              key={bed.id}
              className={`rounded-2xl p-4 border transition-all text-xs flex flex-col justify-between ${
                isAvail 
                  ? 'bg-white border-emerald-300 shadow-sm hover:shadow-md hover:border-emerald-500' 
                  : bed.status === 'OCCUPIED'
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-amber-50/50 border-amber-200'
              }`}
            >
              <div>
                {/* Hierarchy Breadcrumb */}
                <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1 truncate">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{bed.building} → Fl.{bed.floor}</span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-slate-900 text-sm font-mono">
                    {bed.bedNumber}
                  </h3>
                  {getStatusBadge(bed.status)}
                </div>

                <div className="text-[11px] font-semibold text-slate-700 mb-2">
                  {bed.wardName}
                </div>

                <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  <div>
                    <span className="text-slate-400">Category: </span>
                    <span className="font-semibold text-slate-700">{bed.bedCategory}</span>
                  </div>
                  {bed.patientName && (
                    <div className="text-slate-700 truncate">
                      <span className="text-slate-400">Patient: </span>
                      <span className="font-semibold">{bed.patientName}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Last Synced: </span>
                    <span>{bed.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* Staff Edit Controls (if logged in as Staff or testing) */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  {isStaff ? 'Staff Control:' : 'Status:'}
                </span>

                {isStaff ? (
                  <select
                    value={bed.status}
                    onChange={e => handleStatusChange(bed.id, e.target.value as BedStatus)}
                    className="text-[10px] font-bold border border-slate-300 rounded-lg px-2 py-0.5 bg-white"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                ) : (
                  <span className="text-[10px] font-bold text-teal-700">
                    {isAvail ? 'Ready for Allocation' : 'Occupied'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
