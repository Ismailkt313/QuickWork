import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProfile } from "../../auth/services/authApi";
import { toast } from "react-hot-toast";
import {
  RiSaveLine,
  RiUser3Line,
  RiPhoneLine,
  RiCameraLine,
} from "react-icons/ri";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import { AxiosError } from "axios";

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

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-4 overflow-hidden animate-slide-up">
          <div className="modal-header border-0 bg-primary text-white p-4">
            <h5 className="modal-title fw-bold">Update Profile</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                    className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm border border-2 border-white d-flex align-items-center justify-content-center cursor-pointer"
                    style={{ width: "36px", height: "36px", cursor: "pointer" }}
                  >
                    <RiCameraLine size={18} />
                    <input
                      id="profile-upload"
                      type="file"
                      className="d-none"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="small text-secondary mt-2 mb-0">
                  Click the camera icon to change photo
                </p>
                <p
                  className="extra-small text-muted"
                  style={{ fontSize: "10px" }}
                >
                  JPG, PNG or GIF (Max 2MB)
                </p>
              </div>

              <div className="mb-3 text-start">
                <label className="form-label small fw-bold text-secondary">
                  Full Name
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary">
                    <RiUser3Line />
                  </span>
                  <input
                    {...register("name")}
                    type="text"
                    className={`form-control bg-light border-start-0 ps-0 ${errors.name ? "is-invalid" : ""}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <div className="invalid-feedback d-block text-danger small mt-1">
                      {errors.name.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-1 text-start">
                <label className="form-label small fw-bold text-secondary">
                  Phone Number
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary">
                    <RiPhoneLine />
                  </span>
                  <input
                    {...register("number")}
                    type="text"
                    className={`form-control bg-light border-start-0 ps-0 ${errors.number ? "is-invalid" : ""}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.number && (
                    <div className="invalid-feedback d-block text-danger small mt-1">
                      {errors.number.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-4 pt-0 d-flex gap-2">
              <button
                type="button"
                className="btn btn-light rounded-3 px-4 fw-bold flex-grow-1"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-3 px-4 fw-bold flex-grow-2"
                disabled={isSubmitting}
                style={{ minWidth: "140px" }}
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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileModal;
