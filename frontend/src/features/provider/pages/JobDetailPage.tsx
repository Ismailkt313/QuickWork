import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine, RiErrorWarningLine,
  RiGroupLine, RiUserAddLine,
  RiMapPinUserLine, RiMapPinRangeLine,
} from "react-icons/ri";
import { useJobDetails } from "../hooks/useJobDetails";
import JobDetailHeader from "../components/JobDetailHeader";
import JobInfoCard from "../components/JobInfoCard";
import JobActionPanel from "../components/JobActionPanel";
import UniversalActionModal from "../components/UniversalActionModal";
import ActionErrorModal from "../components/ActionErrorModal";
import { toast } from "react-toastify";
import { useProviderLocation } from "../hooks/useProviderLocation";
import { acceptJob, getMyProfile, acceptOffer, rejectOffer } from "../services/provider.service";
import VerificationPendingModal from "../components/VerificationPendingModal";
import { ClientProfileModal } from "../components/ClientProfileModal";
import RejectConfirmationModal from "../components/RejectConfirmationModal";
import Map from "../components/Map";

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams() as { jobId: string };
  const navigate  = useNavigate();
  const { job, loading, error } = useJobDetails(jobId);

  const [isLocationModalOpen, setIsLocationModalOpen] = React.useState(false);
  const [isAccepting,         setIsAccepting]         = React.useState(false);
  const [actionError,         setActionError]         = React.useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });
  const [verificationStatus,  setVerificationStatus]  = React.useState<string>("pending");
  const [isPendingModalOpen,  setIsPendingModalOpen]  = React.useState(false);
  const [isProfileModalOpen,  setIsProfileModalOpen]  = React.useState(false);
  const [isRejectModalOpen,   setIsRejectModalOpen]   = React.useState(false);

  const providerLocation = useProviderLocation();

  React.useEffect(() => {
    getMyProfile<{ verificationStatus: string }>().then(r => { if (r.success && r.data) setVerificationStatus(r.data.verificationStatus || "pending"); }).catch(() => {});
  }, []);

  const handleAccept = () => {
    if (verificationStatus === "pending") { setIsPendingModalOpen(true); return; }
    if (job && job.location?.districtName !== providerLocation) setIsLocationModalOpen(true);
    else processAccept();
  };

  const processAccept = async () => {
    if (isAccepting || !job) return;
    setIsAccepting(true);
    try {
      const result = job.visibility === "private" ? await acceptOffer(jobId) : await acceptJob(jobId);
      if (result.success) {
        toast.success(job.visibility === "private" ? "Offer accepted!" : "Job accepted!");
        navigate("/provider/my-jobs");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to accept job";
      setActionError({ isOpen: true, title: msg.toLowerCase().includes("overlap") ? "Schedule Conflict" : "Action Failed", message: msg });
    } finally { setIsAccepting(false); }
  };

  const confirmReject = async () => {
    if (!job || isAccepting) return;
    setIsAccepting(true);
    try {
      const result = await rejectOffer(jobId);
      if (result.success) { toast.info("Offer rejected."); navigate("/provider/requests"); }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to reject offer";
      toast.error(msg);
    }
    finally { setIsAccepting(false); setIsRejectModalOpen(false); }
  };

  const handleMessage = () => {
    if (job) navigate(`/provider/messages?userId=${job.clientId}&name=${encodeURIComponent(job.clientName)}`);
  };

  if (loading) return <JobDetailSkeleton />;

  if (error || !job) return (
    <div style={{ minHeight:"80vh", background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:"#fff", borderRadius:20, border:"1px solid #e8edf4", padding:48, maxWidth:440, textAlign:"center", boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
        <div style={{ width:80, height:80, borderRadius:22, background:"#fef2f2", color:"#ef4444", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <RiErrorWarningLine size={40}/>
        </div>
        <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, color:"#0f172a", margin:"0 0 10px" }}>Job Not Found</h3>
        <p style={{ color:"#64748b", fontSize:14, lineHeight:1.6, margin:"0 0 24px" }}>{error || "This job doesn't exist or you don't have permission to view it."}</p>
        <button onClick={() => navigate("/provider/available-jobs")}
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
          <RiArrowLeftLine size={16}/> Return to Marketplace
        </button>
      </div>
    </div>
  );

  const isNew = job.createdAt ? new Date().getTime() - new Date(job.createdAt).getTime() < 86400000 : false;

  return (
    <div style={{ background:"#f1f5f9", minHeight:"100vh", padding:"28px 32px 60px" }}>
      {}
      <button onClick={() => navigate(-1)}
        style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"#fff", color:"#64748b", fontSize:13.5, fontWeight:600, cursor:"pointer", marginBottom:24, transition:"all 0.2s" }}
        onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color="#6366f1";(e.currentTarget as HTMLButtonElement).style.borderColor="#a5b4fc";}}
        onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color="#64748b";(e.currentTarget as HTMLButtonElement).style.borderColor="#e2e8f0";}}
      >
        <RiArrowLeftLine size={16}/> Back to Marketplace
      </button>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:24, alignItems:"start", maxWidth:1200 }}>
        {}
        <div>
          {}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e8edf4", padding:"24px 28px", marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <JobDetailHeader
              title={job.title}
              location={job.location}
              additionalDetails={job.additionalDetails}
              postedAt={job.postedAt}
              isUrgent={job.isUrgent}
              isNew={isNew}
            />

            {}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:16, paddingTop:16, borderTop:"1px solid #f1f5f9" }}>
              {[
                { icon:<RiUserAddLine size={14}/>, label:`${job.acceptedFreelancers} of ${job.freelancersNeeded} Hired`, bg:"#eff6ff", color:"#3b82f6" },
                { icon:<RiGroupLine size={14}/>,   label:`${job.applicants} Applicants`,           bg:"#f0fdf4", color:"#16a34a" },
              ].map((p, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, background:p.bg, color:p.color, fontSize:12.5, fontWeight:700 }}>
                  {p.icon} {p.label}
                </div>
              ))}
            </div>
          </div>

          {}
          {job.location?.lat && job.location?.lng && (
            <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid #e8edf4", marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <Map lat={job.location.lat} lng={job.location.lng} address={job.location.address}/>
            </div>
          )}

          {}
          <JobInfoCard
            description={job.description}
            client={{ name: job.clientName, initials: job.clientInitials, rating: job.clientRating, reviewsCount: job.clientReviewsCount, isVerified: job.isClientVerified, avatarUrl: job.clientAvatarUrl }}
            skills={job.skills}
            onViewProfile={() => setIsProfileModalOpen(true)}
          />
        </div>

        {}
        <div>
          <JobActionPanel
            budget={job.budget}
            duration={job.durationType?.replace(/_/g, " ") || "Not Specified"}
            location={job.location}
            startDate={job.startDate}
            endDate={job.endDate}
            freelancersNeeded={job.freelancersNeeded}
            isApplied={job.isApplied || !!job.myApplication}
            isAssigned={job.status === "fully_assigned"}
            isPrivate={job.visibility === "private"}
            contactNumber={job.clientNumber}
            onAccept={handleAccept}
            onReject={() => setIsRejectModalOpen(true)}
            onMessage={handleMessage}
          />
        </div>
      </div>

      {}
      {job && (
        <UniversalActionModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} onConfirm={processAccept} title="Location Mismatch" message="This job is outside your default work zone. Confirm you can travel." iconType="location">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:12 }}>
            <div style={{ padding:"12px 14px", background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0" }}>
              <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em", display:"flex", alignItems:"center", gap:4, marginBottom:6 }}><RiMapPinUserLine size={11}/> Your Zone</div>
              <div style={{ fontWeight:700, color:"#0f172a", fontSize:13 }}>{providerLocation || "Not Set"}</div>
            </div>
            <div style={{ padding:"12px 14px", background:"#eff6ff", borderRadius:10, border:"1px solid #bfdbfe" }}>
              <div style={{ fontSize:9, fontWeight:700, color:"#6366f1", textTransform:"uppercase", letterSpacing:"0.07em", display:"flex", alignItems:"center", gap:4, marginBottom:6 }}><RiMapPinRangeLine size={11}/> Job Zone</div>
              <div style={{ fontWeight:700, color:"#6366f1", fontSize:13 }}>{job.location?.address || "Remote"}</div>
            </div>
          </div>
        </UniversalActionModal>
      )}

      <ActionErrorModal isOpen={actionError.isOpen} onClose={() => setActionError(p => ({ ...p, isOpen: false }))} title={actionError.title} message={actionError.message}
        primaryAction={actionError.title === "Schedule Conflict" ? { label: "View My Schedule", onClick: () => navigate("/provider/my-jobs") } : undefined}/>
      <VerificationPendingModal isOpen={isPendingModalOpen} onClose={() => setIsPendingModalOpen(false)}/>
      <ClientProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}
        client={{ name: job?.clientName ?? "", email: job?.clientEmail, phone: job?.clientNumber, initials: job?.clientInitials ?? "", avatarUrl: job?.clientAvatarUrl, isVerified: job?.isClientVerified }}/>
      <RejectConfirmationModal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} onConfirm={confirmReject} jobTitle={job?.title} isActionLoading={isAccepting}/>

      <style>{`
        @media (max-width: 991px) {
          .jdp-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 767px) {
          .jdp-root { padding: 16px 16px 80px !important; }
        }
      `}</style>
    </div>
  );
};

const JobDetailSkeleton: React.FC = () => (
  <div style={{ background:"#f1f5f9", minHeight:"100vh", padding:"28px 32px" }}>
    {[{ w:120, h:36 }, { w:"100%", h:200 }, { w:"100%", h:300 }].map((s, i) => (
      <div key={i} style={{ width:s.w, height:s.h, borderRadius:12, marginBottom:16, background:"linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)", backgroundSize:"200% 100%", animation:"skel 1.4s ease infinite" }}/>
    ))}
    <style>{`@keyframes skel { from{background-position:200% 0} to{background-position:-200% 0} }`}</style>
  </div>
);

export default JobDetailPage;
