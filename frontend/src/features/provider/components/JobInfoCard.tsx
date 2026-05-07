import React from "react";
import { RiStarFill, RiVerifiedBadgeFill, RiUserLine, RiFileTextLine, RiToolsLine } from "react-icons/ri";

interface JobInfoCardProps {
  description: string;
  client: { id: string; name: string; initials: string; rating?: number; reviewsCount?: number; isVerified?: boolean; avatarUrl?: string; };
  skills: string[];
  onViewProfile?: () => void;
  onViewReviews?: () => void;
}

const AVATAR_COLORS = ["linear-gradient(135deg,#6366f1,#8b5cf6)","linear-gradient(135deg,#06b6d4,#0ea5e9)","linear-gradient(135deg,#f97316,#ef4444)","linear-gradient(135deg,#22c55e,#16a34a)","linear-gradient(135deg,#f59e0b,#d97706)"];
const getColor = (n: string) => AVATAR_COLORS[(n?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e8edf4", padding:"22px 24px", marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
      <div style={{ width:32, height:32, borderRadius:9, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", color:"#6366f1" }}>{icon}</div>
      <h4 style={{ margin:0, fontFamily:"Syne,sans-serif", fontSize:16, fontWeight:800, color:"#0f172a" }}>{title}</h4>
    </div>
    {children}
  </div>
);

const JobInfoCard: React.FC<JobInfoCardProps> = ({ description, client, skills, onViewProfile, onViewReviews }) => (
  <div>
    {}
    <Section icon={<RiUserLine size={16}/>} title="About the Client">
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ position:"relative", flexShrink:0 }}>
          {client.avatarUrl
            ? <img src={client.avatarUrl} alt={client.name} style={{ width:60, height:60, borderRadius:14, objectFit:"cover", border:"3px solid #fff", boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}/>
            : <div style={{ width:60, height:60, borderRadius:14, background:getColor(client.name), display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:20, boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}>{client.initials}</div>
          }
          {client.isVerified && (
            <div style={{ position:"absolute", bottom:-4, right:-4, background:"#fff", borderRadius:"50%", color:"#3b82f6", lineHeight:0 }}>
              <RiVerifiedBadgeFill size={20}/>
            </div>
          )}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:16, color:"#0f172a" }}>{client.name}</span>
            {client.isVerified && <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:10, background:"#eff6ff", color:"#3b82f6", border:"1px solid #bfdbfe", textTransform:"uppercase" }}>Verified</span>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:13 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onViewReviews?.(); }}
              style={{ display:"flex", alignItems:"center", gap:3, fontWeight:700, color:"#f59e0b", border:"none", background:"none", padding:0, cursor:"pointer" }}
            >
              <RiStarFill size={13}/> {(client.rating || 0).toFixed(1)}
              <span style={{ color:"#64748b", fontWeight:500, marginLeft:4, textDecoration:"underline" }}>({client.reviewsCount || 0} reviews)</span>
            </button>
          </div>
        </div>
        {onViewProfile && (
          <button onClick={onViewProfile}
            style={{ padding:"8px 16px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"#fff", color:"#475569", fontSize:12.5, fontWeight:600, cursor:"pointer", flexShrink:0, transition:"all 0.2s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="#a5b4fc";(e.currentTarget as HTMLButtonElement).style.color="#6366f1";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="#e2e8f0";(e.currentTarget as HTMLButtonElement).style.color="#475569";}}
          >View Profile</button>
        )}
      </div>
    </Section>

    {}
    <Section icon={<RiFileTextLine size={16}/>} title="About the Position">
      <div style={{ fontSize:15, color:"#475569", lineHeight:1.8, whiteSpace:"pre-wrap", fontFamily:"Inter,sans-serif" }}>{description}</div>
    </Section>

    {}
    {skills.length > 0 && (
      <Section icon={<RiToolsLine size={16}/>} title="Skills Required">
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {skills.map((skill, i) => (
            <span key={i} style={{ padding:"6px 14px", borderRadius:100, fontSize:13, fontWeight:600, background:"#eff6ff", border:"1px solid #bfdbfe", color:"#3b82f6" }}>{skill}</span>
          ))}
        </div>
      </Section>
    )}
  </div>
);

export default JobInfoCard;
