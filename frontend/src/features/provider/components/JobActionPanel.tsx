import React from "react";
import {
  RiCalendarLine, RiMapPinLine, RiTimeLine, RiMessage3Line,
  RiCloseLine, RiCheckDoubleLine, RiFlashlightLine,
  RiMoneyDollarCircleLine, RiPhoneLine, RiGroupLine,
} from "react-icons/ri";

interface JobLocation { address: string; lat: number; lng: number; districtId: string; districtName?: string; }
interface JobActionPanelProps {
  budget: string; duration: string; location: JobLocation | null;
  startDate: string; endDate?: string; freelancersNeeded?: number;
  isApplied: boolean; isAssigned: boolean; isPrivate?: boolean;
  contactNumber?: string; status?: string;
  onAccept: () => void; onReject?: () => void; onMessage: () => void; onSave?: () => void;
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string; iconBg: string; iconColor: string }> = ({ icon, label, value, iconBg, iconColor }) => (
  <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, background:"#f8fafc", border:"1px solid #f1f5f9" }}>
    <div style={{ width:36, height:36, borderRadius:9, background:iconBg, color:iconColor, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</div>
      <div style={{ fontSize:13.5, fontWeight:600, color:"#1e293b" }}>{value}</div>
    </div>
  </div>
);

const JobActionPanel: React.FC<JobActionPanelProps> = ({
  budget, duration, location, startDate, endDate, freelancersNeeded,
  isApplied, isAssigned, isPrivate, contactNumber, status,
  onAccept, onReject, onMessage,
}) => {
  const isExpired = status === "expired";
  const isDisabled = isAssigned || isApplied || isExpired;

  return (
    <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e8edf4", overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.06)", position:"sticky", top:24 }}>
      {}
      <div style={{ padding:"24px 24px 20px", background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"#fff" }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", opacity:0.75, marginBottom:4 }}>
          <RiMoneyDollarCircleLine size={11} style={{ verticalAlign:"middle", marginRight:4 }}/>Budget Per Provider
        </div>
        <div style={{ fontFamily:"Syne,sans-serif", fontSize:36, fontWeight:800, letterSpacing:"-1px", lineHeight:1.1 }}>{budget}</div>
        {isApplied && (
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10, padding:"6px 12px", borderRadius:8, background:"rgba(255,255,255,0.15)", fontSize:12, fontWeight:600 }}>
            <RiCheckDoubleLine size={14}/> You've already applied to this job
          </div>
        )}
      </div>

      {}
      <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:8 }}>
        <InfoRow icon={<RiTimeLine size={17}/>}     label="Duration"   value={duration}                        iconBg="#eff6ff" iconColor="#3b82f6"/>
        <InfoRow icon={<RiMapPinLine size={17}/>}   label="Location"   value={location?.address || "Remote"}   iconBg="#f0fdf4" iconColor="#16a34a"/>
        <InfoRow icon={<RiCalendarLine size={17}/>} label={endDate && endDate !== startDate ? "Schedule" : "Start Date"} value={endDate && endDate !== startDate ? `${startDate} → ${endDate}` : startDate} iconBg="#fff7ed" iconColor="#ea580c"/>
        {freelancersNeeded !== undefined && (
          <InfoRow icon={<RiGroupLine size={17}/>} label="Providers Needed" value={`${freelancersNeeded} provider${freelancersNeeded > 1 ? "s" : ""}`} iconBg="#faf5ff" iconColor="#9333ea"/>
        )}
        {contactNumber && (
          <InfoRow icon={<RiPhoneLine size={17}/>} label="WhatsApp / Contact" value={contactNumber} iconBg="#f0fdf4" iconColor="#16a34a"/>
        )}
      </div>

      {}
      <div style={{ padding:"0 20px 20px", display:"flex", flexDirection:"column", gap:8 }}>
        <button
          onClick={onAccept}
          disabled={isDisabled}
          style={{
            width:"100%", padding:"13px 20px", borderRadius:11,
            background: isApplied ? "#f0fdf4" : isExpired ? "#fef2f2" : isDisabled ? "#f1f5f9" : "linear-gradient(135deg,#6366f1,#4f46e5)",
            color: isApplied ? "#16a34a" : isExpired ? "#dc2626" : isDisabled ? "#94a3b8" : "#fff",
            fontWeight:700, fontSize:15, cursor: isDisabled ? "not-allowed" : "pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            boxShadow: isDisabled ? "none" : "0 6px 18px rgba(99,102,241,0.35)",
            border: isApplied ? "1.5px solid #bbf7d0" : isExpired ? "1.5px solid #fecaca" : "none",
            transition:"all 0.2s",
          }}
        >
          {isExpired ? <><RiCloseLine size={18}/> Deadline Passed</>
          : isApplied ? <><RiCheckDoubleLine size={18}/> Already Applied</>
          : isAssigned ? "Already Assigned"
          : isPrivate  ? <><RiFlashlightLine size={17}/> Accept Offer</>
          : <><RiFlashlightLine size={17}/> Accept This Job</>}
        </button>

        {isPrivate && !isApplied && !isAssigned && !isExpired && (
          <button onClick={onReject}
            style={{ width:"100%", padding:"12px 20px", borderRadius:11, border:"1.5px solid #fecaca", background:"#fff", color:"#dc2626", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.2s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="#fef2f2";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="#fff";}}
          >
            <RiCloseLine size={18}/> Reject Offer
          </button>
        )}

        <button onClick={onMessage}
          style={{ width:"100%", padding:"12px 20px", borderRadius:11, border:"1.5px solid #e2e8f0", background:"#fff", color:"#475569", fontWeight:600, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.2s" }}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="#a5b4fc";(e.currentTarget as HTMLButtonElement).style.color="#6366f1";}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="#e2e8f0";(e.currentTarget as HTMLButtonElement).style.color="#475569";}}
        >
          <RiMessage3Line size={17}/> Message Client
        </button>
      </div>

      {}
      <style>{`
        @media (max-width: 991px) {
          .job-action-panel-sticky {
            position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important;
            z-index: 1050 !important; border-radius: 20px 20px 0 0 !important;
            box-shadow: 0 -12px 40px rgba(0,0,0,0.1) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JobActionPanel;
