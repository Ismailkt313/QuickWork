import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProfile } from "../../auth/services/authApi";
import { toast } from "react-toastify";
import {
  RiSaveLine,
  RiUser3Line,
  RiPhoneLine,
  RiCameraLine,
} from "react-icons/ri";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import { AxiosError } from "axios";
import { createPortal } from "react-dom";

interface UserProfile {
  name: string;
  number?: string;
  profileImage?: {
    url: string;
    public_id: string;
  };
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  number: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return /^[1-9][0-9]{9}$/.test(val);
      },
      {
        message: "Enter a valid 10-digit phone number (cannot start with 0)",
      },
    ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSuccess: () => void;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 992);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const displayPreview = selectedFile ? previewUrl : (user?.profileImage?.url || null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      number: user?.number || "",
    },
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        name: user.name,
        number: user.number || "",
      });
    }
  }, [isOpen, user, reset]);

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      let profileImageData = user.profileImage;

      if (selectedFile) {
        const uploadResponse = await uploadToCloudinary(
          selectedFile,
          "quickwork/profile-images",
        );
        profileImageData = {
          url: uploadResponse.secure_url,
          public_id: uploadResponse.public_id,
        };
      }

      const response = await updateProfile({
        ...data,
        profileImage: profileImageData,
      });

      if (response.success) {
        toast.success("Profile updated successfully");
        onSuccess();
        onClose();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (error as Error).message ||
          "Failed to update profile",
      );
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="qw-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15,23,42,0.65)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        animation: "qwFadeIn 0.2s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className="qw-modal-content"
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : "480px",
          background: "#fff",
          borderRadius: isMobile ? "24px 24px 0 0" : "24px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
          animation: isMobile ? "qwMobileSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" : "qwSlideUp 0.3s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {isMobile && (
          <div style={{ 
            width: 40, 
            height: 4, 
            background: "#e2e8f0", 
            borderRadius: 2, 
            margin: "12px auto 0",
            flexShrink: 0
          }} />
        )}
        <div className="modal-header border-0 bg-primary text-white p-4" style={{ flexShrink: 0 }}>
          <h5 className="modal-title fw-bold m-0">Update Profile</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={handleClose}
            aria-label="Close"
          ></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ overflowY: "auto", flexGrow: 1 }}>
          <div className="modal-body p-4">
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <div
                  className="overflow-hidden rounded-circle border border-4 border-light shadow-sm bg-light d-flex align-items-center justify-content-center"
                  style={{ width: "100px", height: "100px" }}
                >
                  {displayPreview ? (
                    <img
                      src={displayPreview}
                      alt="Preview"
                      className="w-100 h-100 object-fit-cover"
                    />
                  ) : (
                    <div className="text-secondary opacity-50">
                      <RiUser3Line size={48} />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profile-upload"
                  className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle shadow-sm border border-2 border-white d-flex align-items-center justify-content-center cursor-pointer"
                  style={{ width: "42px", height: "42px", cursor: "pointer", zIndex: 10 }}
                >
                  <RiCameraLine size={20} />
                  <input
                    id="profile-upload"
                    type="file"
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                    }}
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="small text-secondary mt-2 mb-0">
                Click the camera icon to change photo
              </p>
            </div>

            <div className="mb-4 text-start">
              <label className="form-label small fw-bold text-secondary mb-2">
                Full Name
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-secondary px-3">
                  <RiUser3Line />
                </span>
                <input
                  {...register("name")}
                  type="text"
                  className={`form-control bg-light border-start-0 ps-0 ${errors.name ? "is-invalid" : ""}`}
                  placeholder="Enter your full name"
                  style={{ height: "48px", fontSize: isMobile ? "16px" : "14px" }}
                />
              </div>
              {errors.name && (
                <div className="text-danger small mt-1 ps-1">
                  {errors.name.message}
                </div>
              )}
            </div>

            <div className="mb-3 text-start">
              <label className="form-label small fw-bold text-secondary mb-2">
                Phone Number
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-secondary px-3">
                  <RiPhoneLine />
                </span>
                <input
                  {...register("number")}
                  type="text"
                  className={`form-control bg-light border-start-0 ps-0 ${errors.number ? "is-invalid" : ""}`}
                  placeholder="Enter your phone number"
                  style={{ height: "48px", fontSize: isMobile ? "16px" : "14px" }}
                />
              </div>
              {errors.number && (
                <div className="text-danger small mt-1 ps-1">
                  {errors.number.message}
                </div>
              )}
            </div>
          </div>
          <div 
            className="modal-footer border-0 p-4 pt-0 d-flex gap-2"
            style={{ paddingBottom: isMobile ? "calc(16px + env(safe-area-inset-bottom))" : "24px" }}
          >
            <button
              type="button"
              className="btn btn-light rounded-3 px-4 fw-bold flex-grow-1"
              style={{ height: "50px" }}
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-3 px-4 fw-bold flex-grow-2"
              disabled={isSubmitting}
              style={{ minWidth: "140px", height: "50px" }}
            >
              {isSubmitting ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <>
                  <RiSaveLine className="me-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes qwFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes qwSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes qwMobileSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UpdateProfileModal;
