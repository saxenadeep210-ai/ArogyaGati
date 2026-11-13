import React from 'react';
import { X, CreditCard, ShieldCheck, QrCode, Printer, CheckCircle2 } from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { MOCK_ABHA_RECORDS } from '../services/mockData';

interface AbhaCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AbhaCardModal: React.FC<AbhaCardModalProps> = ({ isOpen, onClose }) => {
  const user = hospitalStore.getUser();

  if (!isOpen) return null;

  const abhaKey = user?.abhaId || '14-5544-7788-9922';
  const record = hospitalStore.verifyAbha(abhaKey) || MOCK_ABHA_RECORDS['14-5544-7788-9922'];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2 text-rose-700">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900">ABHA Digital Health Card</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official ABHA Card Styled Component */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-emerald-50 border-2 border-slate-300 rounded-2xl p-5 shadow-lg relative overflow-hidden text-slate-900">
          
          {/* Card Tiranga Header Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 grid grid-cols-3">
            <div className="bg-[#FF9933]"></div>
            <div className="bg-white"></div>
            <div className="bg-[#138808]"></div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 mt-2">
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">
                National Health Authority (NHA)
              </p>
              <h4 className="text-sm font-black text-blue-900">
                Ayushman Bharat Health Account
              </h4>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Citizen</span>
            </div>
          </div>

          <div className="flex gap-4 items-center mb-4">
            <div className="w-20 h-24 bg-slate-200 rounded-xl flex flex-col items-center justify-center font-bold text-slate-400 text-xs border border-slate-300 shrink-0">
              <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold mb-1">
                {record.name[0]}
              </div>
              <span className="text-[9px]">PHOTO</span>
            </div>

            <div className="space-y-1 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Name:</span>
                <span className="font-bold text-slate-900 text-sm">{record.name}</span>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 block">Gender:</span>
                  <span className="font-semibold">{record.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">DOB:</span>
                  <span className="font-semibold">{record.dob}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">ABHA Address:</span>
                <span className="font-mono font-bold text-blue-800 text-[11px]">{record.abhaAddress}</span>
              </div>
            </div>
          </div>

          {/* Large ABHA Number Band */}
          <div className="bg-slate-900 text-white rounded-xl p-3 text-center mb-3">
            <span className="text-[10px] font-mono text-teal-300 uppercase tracking-widest block">
              14-Digit ABHA Number
            </span>
            <span className="text-lg font-mono font-black tracking-widest text-white">
              {record.abhaNumber}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>Linked Mobile: +91 {record.mobile}</span>
            <span>ABDM Gateway Version 2.0</span>
          </div>

        </div>

        <div className="flex gap-3 pt-5">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Digital Health Card</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
