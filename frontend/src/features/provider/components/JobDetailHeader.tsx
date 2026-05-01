import React from "react";
import {
  RiFlashlightLine, RiTimeLine, RiMapPinLine,
  RiShieldCheckLine, RiSparklingLine, RiAlertLine,
} from "react-icons/ri";
import { useProviderLocation } from "../hooks/useProviderLocation";

interface JobLocation { address: string; lat: number; lng: number; districtId: string; districtName?: string; }
interface JobDetailHeaderProps {
  title: string; isUrgent?: boolean; isNew?: boolean;
  postedAt: string; location: JobLocation | null; additionalDetails?: string;
}

const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({ title, isUrgent, isNew, postedAt, location, additionalDetails }) => {
  const providerLocation = useProviderLocation();
  const jobDistrict = location?.districtName?.toLowerCase().trim() ?? "";
  const myDistrict  = providerLocation?.toLowerCase().trim() ?? "";
  const isMyArea = myDistrict && myDistrict !== "not set" && jobDistrict
    ? jobDistrict.includes(myDistrict) || myDistrict.includes(jobDistrict) : null;

  const badge = (bg: string, color: string, border: string, icon: React.ReactNode, text: string) => (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", background:bg, color, border:`1px solid ${border}` }}>
      {icon}{text}
    </span>
  );

  return (
    <div style={{ marginBottom: 28 }}>
      {}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
        {isUrgent && badge("#fef2f2","#dc2626","#fecaca", <RiFlashlightLine size={11}/>, "Urgent Hire")}
        {isNew    && badge("#eff6ff","#3b82f6","#bfdbfe", <RiSparklingLine size={11}/>, "New Post")}
        {badge("#f0fdf4","#059669","rgba(16,185,129,0.2)", <RiShieldCheckLine size={11}/>, "Verified Job")}
        {isMyArea === true  && badge("#f0fdf4","#16a34a","#bbf7d0", <RiMapPinLine size={11}/>, "Your Area")}
        {isMyArea === false && badge("#fff7ed","#b45309","#fde68a", <RiAlertLine  size={11}/>, "Not Your Area")}
      </div>

      {}
      <h1 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:32, color:"#0f172a", letterSpacing:"-0.8px", lineHeight:1.2, margin:"0 0 14px" }}>
        {title}
      </h1>

      {}
      <div style={{ display:"flex", flexWrap:"wrap", gap:20, alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:"#64748b" }}>
          <RiTimeLine size={16} color="#6366f1" />
          <span>Posted <strong style={{ color:"#0f172a" }}>{postedAt}</strong></span>
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", gap:6, fontSize:14, color:"#64748b" }}>
          <RiMapPinLine size={16} color={isMyArea === false ? "#b45309" : "#16a34a"} style={{ marginTop:2 }} />
          <div>
            <div style={{ fontWeight:600, color:"#334155" }}>{location?.address || "Remote"}</div>
            {location?.districtName && <div style={{ fontSize:12, color:"#94a3b8" }}>{location.districtName}</div>}
            {additionalDetails && <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{additionalDetails}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailHeader;
