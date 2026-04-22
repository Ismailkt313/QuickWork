import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { changePassword } from "../../auth/services/authApi";
import { toast } from "react-hot-toast";
import { RiSaveLine, RiShieldLine, RiLockLine } from "react-icons/ri";

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      const response = await changePassword(data);
      if (response.success) {
        toast.success("Password changed successfully");
        reset();
        onClose();
      }
    } catch (error: any) {
      const errorMessage =
        error.message ||
        (typeof error === "string" ? error : "Failed to change password");

      if (errorMessage.toLowerCase().includes("current password")) {
        setError("currentPassword", { type: "manual", message: errorMessage });
      } else if (errorMessage.toLowerCase().includes("match")) {
        setError("confirmPassword", { type: "manual", message: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-4 overflow-hidden animate-slide-up">
          <div className="modal-header border-0 bg-primary text-white p-4">
            <h5 className="modal-title fw-bold">Change Password</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body p-4 pt-4">
              <div className="mb-3 text-start">
                <label className="form-label small fw-bold text-secondary">
                  Current Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary">
                    <RiShieldLine size={18} />
                  </span>
                  <input
                    {...register("currentPassword")}
                    type="password"
                    className={`form-control bg-light border-start-0 ps-0 ${errors.currentPassword ? "is-invalid" : ""}`}
                    placeholder="Enter your current password"
                  />
                  {errors.currentPassword && (
                    <div className="invalid-feedback d-block text-danger small mt-1">
                      {errors.currentPassword.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3 text-start">
                <label className="form-label small fw-bold text-secondary">
                  New Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary">
                    <RiLockLine size={18} />
                  </span>
                  <input
                    {...register("newPassword")}
                    type="password"
                    className={`form-control bg-light border-start-0 ps-0 ${errors.newPassword ? "is-invalid" : ""}`}
                    placeholder="Enter new password"
                  />
                  {errors.newPassword && (
                    <div className="invalid-feedback d-block text-danger small mt-1">
                      {errors.newPassword.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-1 text-start">
                <label className="form-label small fw-bold text-secondary">
                  Confirm New Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary">
                    <RiLockLine size={18} />
                  </span>
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    className={`form-control bg-light border-start-0 ps-0 ${errors.confirmPassword ? "is-invalid" : ""}`}
                    placeholder="Confirm your new password"
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback d-block text-danger small mt-1">
                      {errors.confirmPassword.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-4 pt-0 d-flex gap-2">
              <button
                type="button"
                className="btn btn-light rounded-3 px-4 fw-bold flex-grow-1"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-3 px-4 fw-bold flex-grow-2"
                disabled={isSubmitting}
                style={{ minWidth: "160px" }}
              >
                {isSubmitting ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  <RiSaveLine className="me-1" />
                )}
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordModal;
