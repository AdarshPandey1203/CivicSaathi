import React, { useState } from 'react';
import {
  User,
  Building2,
  Lock,
  Mail,
  Phone,
  BadgeCheck,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UserAccount, GovAccount } from '../types';
import { DEFAULT_CITIZEN, DEFAULT_GOV_OFFICER } from '../data/mockReports';

interface AuthPageProps {
  onCitizenLogin: (user: UserAccount) => void;
  onGovLogin: (officer: GovAccount) => void;
  onOpenPresentation?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onCitizenLogin, onGovLogin, onOpenPresentation }) => {
  const [activePortal, setActivePortal] = useState<'citizen' | 'government'>('citizen');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Citizen Form State
  const [citizenForm, setCitizenForm] = useState({
    name: '',
    email: '',
    phone: '',
    wardOrArea: 'Green Valley Ward 14',
    password: '',
  });

  // Government Form State
  const [govForm, setGovForm] = useState({
    name: '',
    email: '',
    officialId: '',
    department: 'Public Works Department (PWD)',
    designation: 'Ward Municipal Engineer',
    password: '',
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const email = citizenForm.email.trim();
    const name = citizenForm.name.trim();

    if (isRegister) {
      if (!name) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!validateEmail(email)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (citizenForm.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters for security.');
        return;
      }

      onCitizenLogin({
        id: `usr-${Date.now()}`,
        name: name,
        email: email,
        phone: citizenForm.phone.trim() || '+91 98765 43210',
        role: 'citizen',
        wardOrArea: citizenForm.wardOrArea.trim() || 'Green Valley Ward 14',
      });
    } else {
      // Citizen Login validation
      if (!validateEmail(email) && email !== '') {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (citizenForm.password && citizenForm.password.length < 4) {
        setErrorMessage('Please enter your full account password.');
        return;
      }
      onCitizenLogin({
        ...DEFAULT_CITIZEN,
        email: email || DEFAULT_CITIZEN.email,
        name: email ? email.split('@')[0].replace(/[._]/g, ' ') : DEFAULT_CITIZEN.name,
      });
    }
  };

  const handleGovSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const email = govForm.email.trim();
    const name = govForm.name.trim();

    if (isRegister) {
      if (!name) {
        setErrorMessage('Please enter the officer name.');
        return;
      }
      if (!validateEmail(email)) {
        setErrorMessage('Please enter a valid official government email address.');
        return;
      }
      if (govForm.password.length < 6) {
        setErrorMessage('Officer security password must be at least 6 characters.');
        return;
      }

      onGovLogin({
        id: `gov-${Date.now()}`,
        name: name,
        email: email,
        role: 'government',
        department: govForm.department,
        officialId: govForm.officialId.trim() || `GOV-${Math.floor(1000 + Math.random() * 9000)}`,
        designation: govForm.designation.trim() || 'Municipal Officer',
      });
    } else {
      // Gov Login
      if (!validateEmail(email) && email !== '') {
        setErrorMessage('Please enter a valid departmental email address.');
        return;
      }
      onGovLogin({
        ...DEFAULT_GOV_OFFICER,
        email: email || DEFAULT_GOV_OFFICER.email,
        department: govForm.department || DEFAULT_GOV_OFFICER.department,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-700 text-white font-black text-2xl shadow-sm mb-3">
          CS
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">CivicSaathi</h1>
        <p className="text-xs text-slate-600 mt-1">
          Civic Issue Reporting & Department Resolution Platform
        </p>

        {onOpenPresentation && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onOpenPresentation}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Open Project Presentation (PPT)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* 2 Portal Selector Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActivePortal('citizen');
                setIsRegister(false);
                setErrorMessage(null);
              }}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePortal === 'citizen'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span>1. User / Citizen Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePortal('government');
                setIsRegister(false);
                setErrorMessage(null);
              }}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePortal === 'government'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>2. Government / Dept Portal</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Sub-heading & Mode Switcher (Login vs Register) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {activePortal === 'citizen'
                    ? isRegister
                      ? 'Register Citizen Account'
                      : 'Citizen / User Sign In'
                    : isRegister
                    ? 'Register Department Official'
                    : 'Government Official Sign In'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activePortal === 'citizen'
                    ? isRegister
                      ? 'Create an account to submit & track civic issues'
                      : 'Sign in to report civic problems & track repair status'
                    : isRegister
                    ? 'Register as municipal department official'
                    : 'Sign in with government department credentials'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                {isRegister ? 'Switch to Sign In' : 'New? Register here'}
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1-Click Fast Autofill Demo */}
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {activePortal === 'citizen'
                    ? 'Instant test: Login with verified citizen account.'
                    : 'Instant test: Login as Municipal PWD Officer.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activePortal === 'citizen') {
                    onCitizenLogin(DEFAULT_CITIZEN);
                  } else {
                    onGovLogin(DEFAULT_GOV_OFFICER);
                  }
                }}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] whitespace-nowrap shadow-xs transition-colors"
              >
                1-Click Demo
              </button>
            </div>

            {/* PORTAL 1: CITIZEN FORM */}
            {activePortal === 'citizen' && (
              <form onSubmit={handleCitizenSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={citizenForm.name}
                      onChange={(e) => setCitizenForm({ ...citizenForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder={isRegister ? 'you@email.com' : 'citizen@civicsaathi.in'}
                      value={citizenForm.email}
                      onChange={(e) => setCitizenForm({ ...citizenForm, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {isRegister && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={citizenForm.phone}
                        onChange={(e) => setCitizenForm({ ...citizenForm, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ward / Neighborhood
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Green Valley Ward 14"
                        value={citizenForm.wardOrArea}
                        onChange={(e) => setCitizenForm({ ...citizenForm, wardOrArea: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={isRegister ? 'Min 6 characters' : '••••••••'}
                      value={citizenForm.password}
                      onChange={(e) => setCitizenForm({ ...citizenForm, password: e.target.value })}
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>{isRegister ? 'Complete Citizen Registration' : 'Sign In as Citizen'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* PORTAL 2: GOVERNMENT FORM */}
            {activePortal === 'government' && (
              <form onSubmit={handleGovSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Officer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Singh"
                      value={govForm.name}
                      onChange={(e) => setGovForm({ ...govForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={govForm.department}
                    onChange={(e) => setGovForm({ ...govForm, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 bg-white text-slate-800 font-medium"
                  >
                    <option value="Public Works Department (PWD)">Public Works Department (PWD - Roads)</option>
                    <option value="Solid Waste Management Department">Solid Waste Management Department</option>
                    <option value="Sanitation & Drainage Board">Sanitation & Drainage Board</option>
                    <option value="Water Supply & Sewerage Board">Water Supply & Sewerage Board</option>
                    <option value="Electrical & Public Lighting Department">Electrical & Public Lighting Department</option>
                    <option value="Municipal Corporation Secretariat">Municipal Corporation Secretariat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Government Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder={isRegister ? 'officer.pwd@gov.in' : 'officer@gov.in'}
                      value={govForm.email}
                      onChange={(e) => setGovForm({ ...govForm, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {isRegister && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Employee / Officer ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. GOV-PWD-4091"
                        value={govForm.officialId}
                        onChange={(e) => setGovForm({ ...govForm, officialId: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Zonal Road Engineer"
                        value={govForm.designation}
                        onChange={(e) => setGovForm({ ...govForm, designation: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={isRegister ? 'Min 6 characters' : '••••••••'}
                      value={govForm.password}
                      onChange={(e) => setGovForm({ ...govForm, password: e.target.value })}
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>{isRegister ? 'Register Department Officer' : 'Sign In as Government Official'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Security Guarantee Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Encrypted Session · Protected Municipal Citizen System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
