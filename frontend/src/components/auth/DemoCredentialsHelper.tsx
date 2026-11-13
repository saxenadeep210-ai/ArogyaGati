import React, { useState } from 'react';
import { DEMO_CREDENTIALS } from '../../services/mockAuthService';
import { Sparkles, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { PortalType } from '../../types/auth.types';

interface DemoCredentialsHelperProps {
  portal: PortalType;
  onFillDemo: (credentials: any) => void;
}

export const DemoCredentialsHelper: React.FC<DemoCredentialsHelperProps> = ({
  portal,
  onFillDemo,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cred = DEMO_CREDENTIALS[portal];
  if (!cred) return null;

  const handleFill = () => {
    onFillDemo(cred);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 transition-all text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#3435D8]">
            Hackathon Demo Mode
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-[#737B91] hover:text-[#171B2C] flex items-center gap-1 font-medium cursor-pointer"
        >
          <span>{isOpen ? 'Hide Credentials' : 'Quick Demo Fill'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-[#737B91] truncate">
          <strong className="text-[#171B2C]">{cred.name}</strong> • {cred.description}
        </p>
        <button
          type="button"
          onClick={handleFill}
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#3435D8] text-white hover:bg-[#2424B8] shadow-xs transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-300" />
              <span>Filled!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              <span>1-Click Fill</span>
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-indigo-100 text-xs text-[#171B2C] space-y-1 font-mono bg-white/70 p-2.5 rounded-lg">
          {portal === 'patient' && (
            <>
              <div><span className="text-[#737B91]">Mobile:</span> {(cred as any).mobile}</div>
              <div><span className="text-[#737B91]">ABHA:</span> {(cred as any).abhaId}</div>
              <div><span className="text-[#737B91]">Email:</span> {(cred as any).email}</div>
              <div><span className="text-[#737B91]">Password:</span> {(cred as any).password}</div>
              <div><span className="text-[#737B91]">OTP:</span> 123456</div>
            </>
          )}
          {portal === 'doctor' && (
            <>
              <div><span className="text-[#737B91]">Doctor ID:</span> {(cred as any).doctorId}</div>
              <div><span className="text-[#737B91]">Email:</span> {(cred as any).email}</div>
              <div><span className="text-[#737B91]">Password:</span> {(cred as any).password}</div>
            </>
          )}
          {portal === 'admin' && (
            <>
              <div><span className="text-[#737B91]">Admin ID:</span> {(cred as any).adminId}</div>
              <div><span className="text-[#737B91]">Email:</span> {(cred as any).email}</div>
              <div><span className="text-[#737B91]">Password:</span> {(cred as any).password}</div>
              <div><span className="text-[#737B91]">MFA Token:</span> {(cred as any).mfaCode}</div>
            </>
          )}
          {portal === 'ambulance' && (
            <>
              <div><span className="text-[#737B91]">Ambulance ID:</span> {(cred as any).vehicleId}</div>
              <div><span className="text-[#737B91]">Paramedic ID:</span> {(cred as any).driverId}</div>
              <div><span className="text-[#737B91]">Mobile:</span> {(cred as any).mobile}</div>
              <div><span className="text-[#737B91]">OTP/Code:</span> 123456</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
