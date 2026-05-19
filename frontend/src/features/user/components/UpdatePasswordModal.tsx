import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { changePassword } from "../../auth/services/authApi";
import { toast } from "react-toastify";
import { RiSaveLine, RiShieldLine, RiLockLine } from "react-icons/ri";
import { createPortal } from "react-dom";

const getPasswordSchema = (hasPassword?: boolean) => z
  .object({
    currentPassword: hasPassword === false ? z.string().optional() : z.string().min(6, "Current password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
};

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasPassword?: boolean;
  onSuccess?: () => void;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
  isOpen,
  onClose,
  hasPassword,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(getPasswordSchema(hasPassword)) as any,
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      const response = await changePassword(data);

      if (response.success) {
        toast.success(hasPassword === false ? "Password set successfully" : "Password changed successfully");
        reset();
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.message || "Failed to change password");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      if (errorMessage.toLowerCase().includes("current password")) {
        setError("currentPassword", { type: "manual", message: errorMessage });
      } else if (errorMessage.toLowerCase().includes("match")) {
        setError("confirmPassword", { type: "manual", message: errorMessage });
      } else {
        setError("currentPassword",{type: "manual", message: 'enter currect paasword'})
        toast.error('not working')
      }
    }
  };

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
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="qw-modal-content"
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : "440px",
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
          <h5 className="modal-title fw-bold m-0">{hasPassword === false ? "Set Password" : "Change Password"}</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ overflowY: "auto", flexGrow: 1 }}>
          <div className="modal-body p-4 pt-4">
            {hasPassword !== false && (
              <div className="mb-4 text-start">
                <label className="form-label small fw-bold text-secondary mb-2">
                  Current Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary px-3">
                    <RiShieldLine size={18} />
                  </span>
                  <input
                    {...register("currentPassword")}
                    type="password"
                    className={`form-control bg-light border-start-0 ps-0 ${errors.currentPassword ? "is-invalid" : ""}`}
                    placeholder="Enter your current password"
                    style={{ height: "48px", fontSize: isMobile ? "16px" : "14px" }}
                  />
                </div>
                {errors.currentPassword && (
                  <div className="text-danger small mt-1 ps-1">
                    {errors.currentPassword.message}
                  </div>
                )}
              </div>
            )}

            <div className="mb-4 text-start">
              <label className="form-label small fw-bold text-secondary mb-2">
                New Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-secondary px-3">
                  <RiLockLine size={18} />
                </span>
                <input
                  {...register("newPassword")}
                  type="password"
                  className={`form-control bg-light border-start-0 ps-0 ${errors.newPassword ? "is-invalid" : ""}`}
                  placeholder="Enter new password"
                  style={{ height: "48px", fontSize: isMobile ? "16px" : "14px" }}
                />
              </div>
              {errors.newPassword && (
                <div className="text-danger small mt-1 ps-1">
                  {errors.newPassword.message}
                </div>
              )}
            </div>

            <div className="mb-3 text-start">
              <label className="form-label small fw-bold text-secondary mb-2">
                Confirm New Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-secondary px-3">
                  <RiLockLine size={18} />
                </span>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  className={`form-control bg-light border-start-0 ps-0 ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Confirm your new password"
                  style={{ height: "48px", fontSize: isMobile ? "16px" : "14px" }}
                />
              </div>
              {errors.confirmPassword && (
                <div className="text-danger small mt-1 ps-1">
                  {errors.confirmPassword.message}
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
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-3 px-4 fw-bold flex-grow-2"
              disabled={isSubmitting}
              style={{ minWidth: "160px", height: "50px" }}
            >
              {isSubmitting ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <>
                  <RiSaveLine className="me-2" />
                  {hasPassword === false ? "Set Password" : "Update Password"}
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

export default UpdatePasswordModal;
