"use client";

import React, { useState } from "react";
import type { UserRole, User } from "../types";
import {
  MP_USERS,
  DISTRICT_USERS,
  STATE_USERS,
  MINISTRY_USER,
  CITIZEN_USER,
} from "../data/mpladsData";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  IconBuildingArch,
  IconBuildingCommunity,
  IconMapPin,
  IconScale,
  IconUser,
  IconUserCheck,
  IconShieldCheck,
  IconArrowLeft,
  IconArrowRight,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface LoginProps {
  onLogin?: (user: User) => void;
}

interface RoleConfig {
  id: UserRole;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  description: string;
}

const ROLES: RoleConfig[] = [
  {
    id: "MP",
    label: "Member of Parliament",
    subLabel: "Lok Sabha / Rajya Sabha",
    icon: IconBuildingArch,
    description: "Recommend works, track sanctions, fund allocations & constituency progress",
  },
  {
    id: "District",
    label: "District Authority",
    subLabel: "District Collector / DM Office",
    icon: IconBuildingCommunity,
    description: "Administrative approval, work orders, geo-tag inspections & UC submission",
  },
  {
    id: "State",
    label: "State Nodal Department",
    subLabel: "Planning & Development Dept",
    icon: IconMapPin,
    description: "State-wide monitoring, fund consolidation & compliance coordination",
  },
  {
    id: "Ministry",
    label: "Ministry Official",
    subLabel: "MoSPI Central Administration",
    icon: IconScale,
    description: "National dashboard, scheme guidelines, budget release & policy review",
  },
  {
    id: "Citizen",
    label: "Citizen / Public Access",
    subLabel: "Public Transparency Portal",
    icon: IconUser,
    description: "Search works in constituency, view geo-tagged assets & submit feedback",
  },
];

const ROLE_PHONES: Record<UserRole, string> = {
  MP: "98100 12345",
  District: "99100 12345",
  State: "97100 12345",
  Ministry: "96100 12345",
  Citizen: "95100 12345",
};

// Official State Emblem of India representation (Clean vector)
const StateEmblem = () => (
  <svg viewBox="0 0 100 120" className="w-8 h-10 text-foreground" fill="currentColor">
    <path d="M50 5 C52 5 54 7 54 10 L54 18 C58 19 62 22 65 26 C68 22 72 19 76 18 L76 10 C76 7 78 5 80 5 C82 5 84 7 84 10 L84 25 C84 32 80 38 74 42 C76 46 76 50 75 55 C73 63 67 70 58 73 L58 82 L70 82 C72 82 74 84 74 86 C74 88 72 90 70 90 L30 90 C28 90 26 88 26 86 C26 84 28 82 30 82 L42 82 L42 73 C33 70 27 63 25 55 C24 50 24 46 26 42 C20 38 16 32 16 25 L16 10 C16 7 18 5 20 5 C22 5 24 7 24 10 L24 18 C28 19 32 22 35 26 C38 22 42 19 46 18 L46 10 C46 7 48 5 50 5 Z M50 22 C45 22 41 26 41 31 C41 36 45 40 50 40 C55 40 59 36 59 31 C59 26 55 22 50 22 Z M50 88 C54.4 88 58 91.6 58 96 C58 100.4 54.4 104 50 104 C45.6 104 42 100.4 42 96 C42 91.6 45.6 88 50 88 Z" opacity="0.9" />
    <circle cx="50" cy="96" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <line x1="20" y1="108" x2="80" y2="108" stroke="currentColor" strokeWidth="2.5" />
    <text x="50" y="117" fontSize="7" fontWeight="bold" textAnchor="middle" fill="currentColor" letterSpacing="1">सत्यमेव जयते</text>
  </svg>
);

// Official DigiLocker Full Logo SVG
const DigiLockerLogo = ({ className = "h-8 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 520 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Purple Document */}
    <path d="M42 6 H94 L138 48 V166 C138 174 132 180 124 180 H42 C34 180 28 174 28 166 V20 C28 12 34 6 42 6 Z" fill="#6320EE" transform="scale(0.58)" />
    {/* Folded Corner */}
    <path d="M94 6 V48 H138 Z" fill="#FFFFFF" opacity="0.3" transform="scale(0.58)" />
    
    {/* Cloud with keyhole */}
    <path
      d="M30 68 C30 57 39 48 50 48 C54.5 48 58 49.5 61.5 52 C66 39 78 30 92 30 C109 30 123 42 125 58 C129 58 133 60 137 64 C143 70 143 79 137 86 C133 92 125 96 116 96 H46 C36 96 30 89 30 80 Z"
      fill="#FFFFFF"
      stroke="#6320EE"
      strokeWidth="5"
      transform="scale(0.68) translate(-16, 12)"
    />
    {/* Keyhole */}
    <circle cx="48" cy="71" r="4" fill="#6320EE" />
    <path d="M46 72 H50 L51.5 82 H44.5 Z" fill="#6320EE" />

    {/* DigiLocker Text */}
    <text x="156" y="68" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="62" fill="#6320EE" letterSpacing="-1">
      DigiLocker
    </text>
    {/* Divider line */}
    <line x1="156" y1="84" x2="510" y2="84" stroke="#6320EE" strokeWidth="1.5" strokeOpacity="0.4" />
    {/* Subtitle */}
    <text x="160" y="106" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="500" fontSize="23" fill="#64748B" letterSpacing="0">
      Your documents anytime, anywhere
    </text>
  </svg>
);

export default function Login({ onLogin }: LoginProps = {}) {
  const auth = useAuth();
  const [phase, setPhase] = useState<"role" | "mobile" | "otp" | "validating">("role");
  const [selectedRole, setSelectedRole] = useState<UserRole>("MP");
  const [mobile, setMobile] = useState(ROLE_PHONES.MP);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(0);
  const [validationMessage, setValidationMessage] = useState("");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setMobile(ROLE_PHONES[role]);
    setPhase("mobile");
  };

  const handleSendOtp = () => {
    setPhase("otp");
    setOtpTimer(30);
    const interval = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-input-${idx + 1}`)?.focus();
    }
    if (next.every((d) => d !== "") && idx === 5) {
      setTimeout(() => handleVerify(next), 200);
    }
  };

  const handleVerify = (otpArr = otp) => {
    setValidationMessage("Verifying OTP against Aadhaar/NIC directory...");
    setPhase("validating");
    setTimeout(() => {
      authenticateUser();
    }, 1200);
  };

  const handleDigiLockerLogin = () => {
    setValidationMessage("Authenticating via MeriPehchaan (National SSO) & DigiLocker...");
    setPhase("validating");
    setTimeout(() => {
      authenticateUser();
    }, 1400);
  };

  const authenticateUser = () => {
    let user: User;
    if (selectedRole === "MP") user = { ...MP_USERS[0], phone: mobile };
    else if (selectedRole === "District") user = { ...DISTRICT_USERS[0], phone: mobile };
    else if (selectedRole === "State") user = { ...STATE_USERS[0], phone: mobile };
    else if (selectedRole === "Ministry") user = { ...MINISTRY_USER, phone: mobile };
    else user = { ...CITIZEN_USER, phone: mobile };
    
    if (onLogin) {
      onLogin(user);
    } else {
      auth.login(user);
    }
  };

  const currentRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans">
      {/* Top Government Header Bar */}
      <header className="bg-card border-b border-border text-card-foreground">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-wide text-foreground">भारत सरकार | Government of India</span>
            <span className="hidden md:inline text-muted-foreground">|</span>
            <span className="hidden md:inline text-muted-foreground">Ministry of Statistics and Programme Implementation (MoSPI)</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a
              href="/"
              className="flex items-center gap-1 text-primary hover:underline text-xs font-semibold cursor-pointer"
            >
              <IconArrowLeft size={14} />
              National Public Portal
            </a>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <span className="flex items-center gap-1 text-primary">
              <IconShieldCheck size={14} />
              Official Portal (e-SAKSHI v2.4)
            </span>
          </div>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-lg">
          {/* Header Title with Emblem */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center p-2 bg-card rounded-md border border-border shadow-xs mb-2.5">
              <StateEmblem />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">NIDHI-RAKSHAK</h1>
            <p className="text-xs text-muted-foreground">
              National Public Fund & Infrastructure Vigilance System
            </p>
          </div>

          <Card className="border-border shadow-sm bg-card">
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-border text-xs">
              <div className={`flex items-center gap-1.5 ${phase === "role" ? "text-foreground font-semibold" : "text-muted-foreground font-medium"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${phase === "role" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  1
                </span>
                Role Selection
              </div>
              <div className="w-8 h-px bg-border" />
              <div className={`flex items-center gap-1.5 ${phase === "mobile" ? "text-foreground font-semibold" : "text-muted-foreground font-medium"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${phase === "mobile" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  2
                </span>
                Authentication
              </div>
              <div className="w-8 h-px bg-border" />
              <div className={`flex items-center gap-1.5 ${phase === "otp" || phase === "validating" ? "text-foreground font-semibold" : "text-muted-foreground font-medium"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${phase === "otp" || phase === "validating" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  3
                </span>
                OTP Verification
              </div>
            </div>

            <CardContent className="p-6 overflow-hidden">
              <AnimatePresence mode="wait">
                {/* Phase 1: Role Selection */}
                {phase === "role" && (
                  <motion.div
                    key="step-role"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                  >
                    <div className="mb-4">
                      <h2 className="text-base font-bold text-foreground">Select Stakeholder Role</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Choose your administrative role to access the authorized workspace.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {ROLES.map((role) => {
                        const Icon = role.icon;
                        const isSelected = selectedRole === role.id;
                        return (
                          <div
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`flex items-start gap-3 p-3 rounded-md border text-left cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-accent border-primary ring-1 ring-primary text-accent-foreground"
                                : "bg-card border-border hover:bg-muted text-card-foreground"
                            }`}
                          >
                            <div className={`p-2 rounded-md mt-0.5 shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                              <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-foreground">
                                  {role.label}
                                </span>
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  {role.subLabel}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                {role.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5">
                      <Button
                        onClick={() => handleRoleSelect(selectedRole)}
                        className="w-full flex items-center justify-center gap-2 text-sm"
                      >
                        <span>Proceed with {currentRoleConfig.label}</span>
                        <IconArrowRight size={16} />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Phase 2: Mobile / DigiLocker Login */}
                {phase === "mobile" && (
                  <motion.div
                    key="step-mobile"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                  >
                    <button
                      onClick={() => setPhase("role")}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 font-medium"
                    >
                      <IconArrowLeft size={14} />
                      Change Role ({currentRoleConfig.label})
                    </button>

                    <div className="mb-4">
                      <h2 className="text-base font-bold text-foreground">Stakeholder Sign In</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Log in to access records for <span className="font-semibold text-foreground">{currentRoleConfig.label}</span> ({currentRoleConfig.subLabel})
                      </p>
                    </div>

                    {/* Mobile Number Authentication */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendOtp();
                      }}
                      className="space-y-3"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="mobile-input" className="text-xs font-semibold text-foreground">
                          Registered Mobile Number
                        </Label>
                        <div className="flex gap-2">
                          <div className="flex items-center px-3 bg-muted border border-input rounded-md text-xs font-semibold text-foreground">
                            +91
                          </div>
                          <Input
                            id="mobile-input"
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="Enter 10-digit mobile number"
                            className="flex-1 font-mono text-sm"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                          <IconInfoCircle size={12} className="shrink-0" />
                          A 6-digit OTP will be dispatched to this verified mobile number.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={mobile.trim().length < 8}
                        className="w-full text-sm mt-2"
                      >
                        Get OTP
                      </Button>
                    </form>

                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full bg-border" />
                      </div>
                      <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                        <span className="bg-card px-2.5 text-muted-foreground font-medium">
                          or continue with digilocker
                        </span>
                      </div>
                    </div>

                    {/* DigiLocker Section */}
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={handleDigiLockerLogin}
                        className="w-full py-3 px-4 rounded-xl bg-[#6B2024] hover:bg-[#581a1d] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
                      >
                        <IconUserCheck size={18} className="text-white shrink-0 stroke-[2.5]" />
                        <span>Continue with DigiLocker</span>
                      </button>

                      <div className="flex justify-center items-center pt-1 pb-1">
                        <DigiLockerLogo className="h-8 w-auto max-w-[200px]" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Phase 3: OTP Verification */}
                {phase === "otp" && (
                  <motion.div
                    key="step-otp"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                  >
                    <button
                      onClick={() => setPhase("mobile")}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 font-medium"
                    >
                      <IconArrowLeft size={14} />
                      Back to Mobile Number
                    </button>

                    <div className="mb-4">
                      <h2 className="text-base font-bold text-foreground">Verify One-Time Password</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enter the 6-digit security code dispatched to{" "}
                        <span className="font-mono font-semibold text-foreground">+91 {mobile}</span>
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between gap-2 max-w-xs mx-auto my-4">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-input-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace" && !digit && idx > 0) {
                                document.getElementById(`otp-input-${idx - 1}`)?.focus();
                              }
                            }}
                            className="w-10 h-12 text-center text-lg font-bold font-mono border border-input rounded-md bg-background text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                          />
                        ))}
                      </div>

                      <p className="text-center text-[11px] text-muted-foreground">
                        Sample environment: enter any 6 digits or wait for verification.
                      </p>

                      <Button
                        type="button"
                        onClick={() => handleVerify()}
                        disabled={otp.some((d) => d === "")}
                        className="w-full text-sm"
                      >
                        Verify and Proceed to Dashboard
                      </Button>

                      <div className="text-center text-xs text-muted-foreground pt-2">
                        {otpTimer > 0 ? (
                          <span>Resend OTP in <strong className="text-foreground">{otpTimer}s</strong></span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-foreground font-medium hover:underline"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Validating State */}
                {phase === "validating" && (
                  <motion.div
                    key="step-validating"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="py-10 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin mb-3" />
                    <h3 className="text-sm font-bold text-foreground">{validationMessage}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Establishing secure SSL session with MoSPI servers...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className="px-6 py-3 bg-muted/40 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between rounded-b-lg">
              <span>National Informatics Centre (NIC)</span>
              <span>Helpdesk: 1800-11-2024</span>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Official Government Footer */}
      <footer className="bg-card text-muted-foreground border-t border-border py-3 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span>Designed, Developed and Hosted by </span>
            <strong className="text-foreground">National Informatics Centre (NIC)</strong>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground">Terms of Use</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground">Hyperlink Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-foreground">Accessibility Statement</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
