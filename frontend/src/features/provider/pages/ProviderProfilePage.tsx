import React, { useState, useEffect } from "react";
import {
  RiEditLine,
  RiMapPinLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiVerifiedBadgeFill,
  RiAddLine,
  RiBriefcaseLine,
  RiAddCircleLine,
  RiInformationLine,
  RiStarFill,
  RiGlobalLine
} from "react-icons/ri";
import {
  getMyProfile,
  fetchallskills,
  fetchLocations,
} from "../services/provider.service";
import FallbackScreen from "../../../components/ui/FallbackScreen";
import { toast } from "react-toastify";
import EditProfileModal from "../components/EditProfileModal";
import EditSkillsModal from "../components/EditSkillsModal";
import EditPortfolioModal from "../components/EditPortfolioModal";
import RequestSkillModal from "../components/RequestSkillModal";
import "./ProviderProfilePage.css";

interface PortfolioItem {
  title: string;
  description: string;
  images: string[];
}

interface Skill {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

interface ProviderProfile {
  name: string;
  profileImage?: string;
  headline?: string;
  location: Location;
  submittedAt: string;
  isActive: boolean;
  about?: string;
  portfolio: PortfolioItem[];
  hourlyRate: number;
  yearsOfExperience: number;
  verificationStatus: string;
  skills: Skill[];
}

const ProviderProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditSkills, setShowEditSkills] = useState(false);
  const [showEditPortfolio, setShowEditPortfolio] = useState(false);
  const [showRequestSkill, setShowRequestSkill] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);

  const loadData = async () => {
    try {
      const [profileRes, skillsRes, locationsRes] = await Promise.all([
        getMyProfile<ProviderProfile>(),
        fetchallskills(),
        fetchLocations(),
      ]);
      if (profileRes.success && profileRes.data) setProfile(profileRes.data);
      if (skillsRes.success && skillsRes.data) setSkills(skillsRes.data);
      if (locationsRes.success && locationsRes.data) setLocations(locationsRes.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load profile data";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <FallbackScreen />;
  if (!profile) return <div className="p-5 text-center">Profile not found</div>;

  const joinedDate = new Date(profile.submittedAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="qw-profile-page animate-fade-in">
      <div className="container py-5">
        {}
        <div className="qw-profile-hero mb-5">
          <div className="qw-hero-banner" />
          <div className="qw-hero-content">
            <div className="qw-profile-image-container">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} className="qw-profile-image" />
              ) : (
                <div className="qw-initials-avatar">
                  {profile.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
              )}
              {profile.verificationStatus === "verified" && (
                <div className="qw-verified-badge" title="Verified Provider">
                  <RiVerifiedBadgeFill />
                </div>
              )}
            </div>
            <div className="qw-profile-info-main">
              <h1 className="qw-profile-name">{profile.name}</h1>
              <p className="qw-profile-headline">{profile.headline || "Professional Provider"}</p>
              <div className="qw-meta-row">
                <div className="qw-meta-item">
                  <RiMapPinLine /> {profile.location.name}
                </div>
                <div className="qw-meta-item">
                  <RiTimeLine /> Joined {joinedDate}
                </div>
                <div className="qw-meta-item">
                  <RiGlobalLine /> {profile.isActive ? "Available Now" : "Currently Away"}
                </div>
              </div>
            </div>
            <button className="qw-btn-edit-profile" onClick={() => setShowEditProfile(true)}>
              <RiEditLine size={18} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        <div className="row g-5">
          {}
          <div className="col-lg-8">
            {}
            <div className="qw-section-card">
              <h3 className="qw-section-title">
                <div className="d-flex align-items-center gap-2">
                  <RiInformationLine className="text-primary" />
                  About Me
                </div>
              </h3>
              <p className="qw-about-text">
                {profile.about || "This provider hasn't shared their story yet. They are dedicated to providing high-quality services to all clients."}
              </p>
            </div>

            {}
            <div className="qw-section-card">
              <div className="qw-section-title">
                <div className="d-flex align-items-center gap-2">
                  <RiStarFill className="text-warning" />
                  Portfolio Projects
                </div>
                <button className="qw-btn-add" onClick={() => { setEditingPortfolioItem(null); setShowEditPortfolio(true); }}>
                  <RiAddLine /> Add Project
                </button>
              </div>
              {profile.portfolio.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <RiBriefcaseLine size={48} className="mb-3 opacity-25" />
                  <p>No projects added to portfolio yet.</p>
                </div>
              ) : (
                <div className="qw-portfolio-grid">
                  {profile.portfolio.map((item, idx) => (
                    <div key={idx} className="qw-portfolio-item">
                      <div className="qw-portfolio-image-box">
                        <img src={item.images[0]} alt={item.title} />
                        <div className="qw-portfolio-overlay">
                          <button className="btn btn-light btn-sm rounded-pill" onClick={() => { setEditingPortfolioItem(item); setShowEditPortfolio(true); }}>
                            <RiEditLine /> Edit
                          </button>
                        </div>
                      </div>
                      <div className="qw-portfolio-details">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {}
          <div className="col-lg-4">
            {}
            <div className="qw-section-card">
              <h3 className="qw-section-title">Service Details</h3>
              <div className="qw-stat-card">
                <div className="qw-stat-icon-box purple">
                  <RiMoneyDollarCircleLine />
                </div>
                <div className="qw-stat-info">
                  <p className="qw-stat-label">Hourly Rate</p>
                  <p className="qw-stat-value">₹{profile.hourlyRate}/hr</p>
                </div>
              </div>
              <div className="qw-stat-card">
                <div className="qw-stat-icon-box blue">
                  <RiBriefcaseLine />
                </div>
                <div className="qw-stat-info">
                  <p className="qw-stat-label">Experience</p>
                  <p className="qw-stat-value">{profile.yearsOfExperience} Years</p>
                </div>
              </div>
              <div className="qw-stat-card">
                <div className="qw-stat-icon-box green">
                  <RiVerifiedBadgeFill />
                </div>
                <div className="qw-stat-info">
                  <p className="qw-stat-label">Verification</p>
                  <p className={`qw-stat-value text-capitalize ${profile.verificationStatus === "verified" ? "text-success" : "text-warning"}`}>
                    {profile.verificationStatus}
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="qw-section-card">
              <div className="qw-section-title">
                Skills
                <button className="qw-btn-add" onClick={() => setShowEditSkills(true)}>
                  <RiEditLine /> Edit
                </button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {profile.skills.map((skill: Skill) => (
                  <div key={skill.id} className="qw-skill-badge">
                    {skill.name}
                  </div>
                ))}
                {profile.skills.length === 0 && (
                  <p className="text-muted small">No skills added yet.</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-top">
                <button className="btn btn-link p-0 text-primary small text-decoration-none d-flex align-items-center gap-2 fw-600" onClick={() => setShowRequestSkill(true)}>
                  <RiAddCircleLine size={18} /> Request New Skill
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditProfile && (
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          onSuccess={loadData}
          provider={profile}
          locations={locations}
        />
      )}

      {showEditSkills && (
        <EditSkillsModal
          isOpen={showEditSkills}
          onClose={() => setShowEditSkills(false)}
          onSuccess={loadData}
          currentSkills={profile.skills}
          allSkills={skills}
        />
      )}

      {showEditPortfolio && (
        <EditPortfolioModal
          isOpen={showEditPortfolio}
          onClose={() => setShowEditPortfolio(false)}
          onSuccess={loadData}
          portfolio={profile.portfolio}
          itemToEdit={editingPortfolioItem}
        />
      )}

      {showRequestSkill && (
        <RequestSkillModal
          isOpen={showRequestSkill}
          onClose={() => setShowRequestSkill(false)}
        />
      )}
    </div>
  );
};

export default ProviderProfilePage;
