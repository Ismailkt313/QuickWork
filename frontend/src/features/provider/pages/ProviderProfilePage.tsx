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

const ProviderProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditSkills, setShowEditSkills] = useState(false);
  const [showEditPortfolio, setShowEditPortfolio] = useState(false);
  const [showRequestSkill, setShowRequestSkill] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<any>(null);

  const loadData = async () => {
    try {
      const [profileRes, skillsRes, locationsRes] = await Promise.all([
        getMyProfile(),
        fetchallskills(),
        fetchLocations(),
      ]);
      console.log(profileRes.data, "profileRes.data");
      if (profileRes.success) setProfile(profileRes.data);
      if (skillsRes.success) setSkills(skillsRes.data);
      if (locationsRes.success) setLocations(locationsRes.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <FallbackScreen />;
  if (!profile) return <div className="p-5 text-center">Profile not found</div>;

  const creationDate = new Date(profile.submittedAt).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );

  return (
    <div className="qw-profile-container container-fluid py-4 animate__animated animate__fadeIn">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="qw-card qw-profile-header mb-4">
            <div className="qw-profile-bg" />
            <div className="qw-profile-header-content p-4">
              <div className="d-flex flex-wrap gap-4 align-items-end">
                <div className="qw-profile-avatar-wrap">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.name}
                      className="qw-profile-avatar"
                    />
                  ) : (
                    <div className="qw-profile-avatar initials">
                      {profile.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  {profile.verificationStatus === "verified" && (
                    <span
                      className="qw-verified-badge"
                      title="Verified Provider"
                    >
                      <RiVerifiedBadgeFill />
                    </span>
                  )}
                </div>
                <div className="qw-profile-basic-info flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h1 className="qw-h1 mb-1">{profile.name}</h1>
                      <p className="qw-headline text-muted mb-2">
                        {profile.headline || "No headline set"}
                      </p>
                      <div className="d-flex flex-wrap gap-3 qw-meta">
                        <span className="d-flex align-items-center gap-1">
                          <RiMapPinLine className="qw-icon-sm" />{" "}
                          {profile.location.name}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <RiTimeLine className="qw-icon-sm" /> Joined{" "}
                          {creationDate}
                        </span>
                        <span
                          className={`badge ${profile.isActive ? "bg-success-subtle text-success" : "bg-secondary-subtle text-muted"}`}
                        >
                          {profile.isActive ? "Active" : "Away"}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-2"
                      onClick={() => setShowEditProfile(true)}
                    >
                      <RiEditLine /> Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="qw-card p-4 mb-4">
            <h3 className="qw-h3 mb-3">About Me</h3>
            <p className="qw-about-text">{profile.about}</p>
          </div>
          <div className="qw-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="qw-h3 m-0">Portfolio</h3>
              <button
                className="btn btn-primary btn-sm rounded-pill d-flex align-items-center gap-2"
                onClick={() => {
                  setEditingPortfolioItem(null);
                  setShowEditPortfolio(true);
                }}
              >
                <RiAddLine /> Add Project
              </button>
            </div>
            <div className="row g-4">
              {profile.portfolio.map((item: any, idx: number) => (
                <div key={idx} className="col-md-6">
                  <div className="qw-portfolio-item h-100">
                    <div className="qw-portfolio-image-wrap">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="qw-portfolio-image"
                      />
                      <div className="qw-portfolio-overlay">
                        <button
                          className="btn btn-light btn-sm rounded-circle"
                          onClick={() => {
                            setEditingPortfolioItem(item);
                            setShowEditPortfolio(true);
                          }}
                        >
                          <RiEditLine />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="qw-h4 mb-1">{item.title}</h4>
                      <p className="small text-muted mb-0">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="qw-card p-4 mb-4">
            <h3 className="qw-h3 mb-4">Service Details</h3>
            <div className="qw-stat-item d-flex align-items-center gap-3 mb-4">
              <div className="qw-stat-icon red">
                <RiMoneyDollarCircleLine />
              </div>
              <div>
                <p className="qw-stat-label">Hourly Rate</p>
                <p className="qw-stat-value">${profile.hourlyRate}/hr</p>
              </div>
            </div>
            <div className="qw-stat-item d-flex align-items-center gap-3 mb-4">
              <div className="qw-stat-icon blue">
                <RiBriefcaseLine />
              </div>
              <div>
                <p className="qw-stat-label">Experience</p>
                <p className="qw-stat-value">
                  {profile.yearsOfExperience} Years
                </p>
              </div>
            </div>
            <div className="qw-stat-item d-flex align-items-center gap-3">
              <div className="qw-stat-icon green">
                <RiVerifiedBadgeFill />
              </div>
              <div>
                <p className="qw-stat-label">Status</p>
                <p
                  className={`qw-stat-value text-capitalize ${profile.verificationStatus === "verified" ? "text-success" : "text-warning"}`}
                >
                  {profile.verificationStatus}
                </p>
              </div>
            </div>
          </div>
          <div className="qw-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="qw-h3 m-0">Skills</h3>
              <button
                className="btn btn-ghost-primary btn-icon btn-sm"
                onClick={() => setShowEditSkills(true)}
              >
                <RiEditLine />
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {profile.skills.map((skill: any) => (
                <span
                  key={skill.id}
                  className="badge bg-light text-primary border px-3 py-2 rounded-pill font-md"
                >
                  {skill.name}
                </span>
              ))}
              {profile.skills.length === 0 && (
                <p className="text-muted small">No skills added yet.</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-top">
              <button
                className="btn btn-link p-0 text-primary small text-decoration-none d-flex align-items-center gap-2 fw-600"
                onClick={() => setShowRequestSkill(true)}
              >
                <RiAddCircleLine size={18} /> Request New Skill
              </button>
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
