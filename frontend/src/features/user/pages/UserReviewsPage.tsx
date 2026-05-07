import React, { useState, useEffect } from "react";
import { RiStarLine, RiChatHeartLine, RiInformationLine } from "react-icons/ri";
import { getMe } from "../../auth/services/authApi";
import ProviderReviewsSection from "../components/ProviderReviewsSection";
import { toast } from "react-toastify";

const UserReviewsPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMe();
        if (response.success) {
          setUserId(response.data.id);
        }
      } catch (error) {
        console.error("Failed to fetch user for reviews:", error);
        toast.error("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 animate-fade-in" style={{ maxWidth: "1000px" }}>
      <div className="mb-4">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="bg-warning-subtle text-warning p-2 rounded-3">
            <RiStarLine size={24} />
          </div>
          <h1 className="h3 fw-bold text-dark mb-0">Reviews & Ratings</h1>
        </div>
        <p className="text-secondary small">
          Feedback and reputation metrics from service providers you've worked with
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          {userId && <ProviderReviewsSection userId={userId} />}
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 bg-primary text-white p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <RiChatHeartLine size={20} />
              <h5 className="fw-bold mb-0">Reputation Matters</h5>
            </div>
            <p className="small opacity-75 mb-0" style={{ lineHeight: "1.6" }}>
              Your reputation as a client is built on every interaction. Higher ratings help you attract the best service providers for your future projects.
            </p>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 border-start border-4 border-info">
            <div className="d-flex align-items-start gap-3">
              <RiInformationLine size={20} className="text-info flex-shrink-0 mt-1" />
              <div>
                <h6 className="fw-bold text-dark mb-2">How it works</h6>
                <p className="text-secondary small mb-0" style={{ lineHeight: "1.5" }}>
                  After a job is marked as completed, providers have the opportunity to rate your communication, clarity, and professionalism.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReviewsPage;
