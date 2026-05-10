import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FiBriefcase,
  FiAlignLeft,
  FiGrid,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiMap,
  FiCalendar,
  FiHash,
  FiX,
  FiZap,
  FiPhone,
} from "react-icons/fi";
import { api } from "../../../../services/api";
import { ENDPOINTS } from "../../../../constants/endpoints";
import { FormInput } from "../../../../shared/components/inputs/FormInput";
import { FormTextarea } from "../../../../shared/components/inputs/FormTextarea";
import { FormSelect } from "../../../../shared/components/inputs/FormSelect";
import type { SelectOption } from "../../../../shared/components/inputs/FormSelect";
import { CategoryRepository } from "../../../../services/repositories/CategoryRepository";
import { LocationRepository } from "../../../../services/repositories/LocationRepository";
import { LocationAutocomplete } from "../../../../shared/components/inputs/LocationAutocomplete";
import { jobService } from "../services/job.service";
import type {
  JobFormData,
  ServiceCategory,
  Location,
} from "../types/job.types";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const backdropRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    contactNumber: "",
    category: "",
    durationType: "half_day",
    startDate: "",
    startTime: "09:00",
    endTime: "18:00",
    days: "",
    minBudget: "",
    maxBudget: "",
    freelancersNeeded: "1",
    districtId: "",
    selectedLocation: null,
    additionalDetails: "",
    isUrgent: false,
  });

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof JobFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, locs, profile] = await Promise.all([
          CategoryRepository.getCategories(),
          LocationRepository.getLocations(),
          api.get(ENDPOINTS.AUTH.ME),
        ]);
        setCategories(cats || []);
        setLocations(locs || []);

        if (profile.data?.success && profile.data.data?.number) {
          setFormData((prev) => ({
            ...prev,
            contactNumber: profile.data.data.number,
          }));
        }
      } catch (error) {
        console.error("Error fetching categories/locations/profile:", error);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "durationType" && value !== "multi_day"
        ? { startDate: "", days: "" }
        : {}),
      ...(name === "districtId" ? { selectedLocation: null } : {}),
    }));
    if (errors[name as keyof JobFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLocationSelect = (loc: {
    address: string;
    lat: number;
    lng: number;
    district: string;
  }) => {
    setFormData((prev) => ({ ...prev, selectedLocation: loc }));
    if (errors.selectedLocation) {
      setErrors((prev) => ({ ...prev, selectedLocation: "" }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof JobFormData, string>> = {};
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    else if (formData.title.length < 5)
      newErrors.title = "Title must be at least 5 characters";

    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.length < 10)
      newErrors.description = "Please provide at least 10 characters";

    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    else if (formData.contactNumber.length < 10)
      newErrors.contactNumber = "Enter a valid phone number";

    if (!formData.districtId) newErrors.districtId = "District is required";
    if (!formData.selectedLocation)
      newErrors.selectedLocation = "Please search and select a location";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";

    if (formData.startTime && formData.endTime) {
      const toMinutes = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      const start = toMinutes(formData.startTime);
      const end = toMinutes(formData.endTime);

      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      } else if (formData.durationType === "half_day") {
        if (end - start > 240) {
          newErrors.endTime = "Half-day jobs cannot exceed 4 hours";
        }
      }
    }

    if (
      formData.durationType === "multi_day" &&
      (!formData.days || Number(formData.days) < 1)
    ) {
      newErrors.days = "Days must be at least 1";
    }

    let requiredMinBudget = 500;
    if (formData.durationType === "half_day") {
      requiredMinBudget = 500;
    } else if (formData.durationType === "full_day") {
      requiredMinBudget = 1000;
    } else if (formData.durationType === "multi_day") {
      const daysCount = Number(formData.days) || 1;
      requiredMinBudget = 1000 * daysCount;
    }

    if (!formData.minBudget || Number(formData.minBudget) < requiredMinBudget) {
      if (formData.durationType === "half_day") {
        newErrors.minBudget = "For a half-day job, min budget per provider must be at least ₹500";
      } else if (formData.durationType === "full_day") {
        newErrors.minBudget = "For a full-day job, min budget per provider must be at least ₹1000";
      } else {
        newErrors.minBudget = `For ${formData.days || 1} days, min budget per provider must be at least ₹${requiredMinBudget} (₹1000/day)`;
      }
    }
    if (!formData.maxBudget || Number(formData.maxBudget) <= 0) {
      newErrors.maxBudget = "Enter max budget";
    } else if (Number(formData.maxBudget) < Number(formData.minBudget)) {
      newErrors.maxBudget = "Max must be >= Min";
    }

    if (!formData.freelancersNeeded || Number(formData.freelancersNeeded) < 1) {
      newErrors.freelancersNeeded = "At least 1 freelancer is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const selectedCategory = categories.find(
        (c) => c.name === formData.category,
      );
      const selectedDistrict = locations.find(
        (l) => l.id === formData.districtId,
      );

      if (
        !selectedCategory ||
        !selectedDistrict ||
        !formData.selectedLocation
      ) {
        toast.error("Invalid selection");
        return;
      }

      const placeDistrict = formData.selectedLocation.district.toLowerCase();
      const chosenDistrictName = selectedDistrict.name.toLowerCase();
      const formattedAddress = formData.selectedLocation.address.toLowerCase();

      if (
        placeDistrict !== chosenDistrictName &&
        !formattedAddress.includes(chosenDistrictName)
      ) {
        setErrors((prev) => ({
          ...prev,
          selectedLocation: `The selected place must be within ${selectedDistrict.name}`,
        }));
        setIsSubmitting(false);
        return;
      }

      const result = await jobService.createJob({
        title: formData.title,
        description: formData.description,
        contactNumber: formData.contactNumber,
        skillId: selectedCategory._id || selectedCategory.id,
        location: {
          district: selectedDistrict.id,
          districtName: selectedDistrict.name,
          address: formData.selectedLocation.address,
          additionalDetails: formData.additionalDetails,
          coordinates: {
            type: "Point",
            coordinates: [
              formData.selectedLocation.lng,
              formData.selectedLocation.lat,
            ],
          },
        },
        budget: {
          min: Number(formData.minBudget),
          max: Number(formData.maxBudget),
        },
        durationType: formData.durationType,
        startDate: formData.startDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        days:
          formData.durationType === "multi_day"
            ? Number(formData.days)
            : undefined,
        freelancersNeeded: Number(formData.freelancersNeeded),
        visibility: "public",
      });

      if (result.success) {
        onClose();
        navigate("/user/jobs");
        toast.success("Job posted successfully!");
      } else {
        toast.error(result.message || "Failed to post job");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: c.name,
    label: c.name,
  }));
  const locationOptions: SelectOption[] = locations.map((l) => ({
    value: l.id,
    label: l.name,
  }));
  const durationOptions = [
    { label: "Half Day (~4 hrs)", value: "half_day" },
    { label: "Full Day (8 hrs)", value: "full_day" },
    { label: "Multiple Days", value: "multi_day" },
  ];

  return createPortal(
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="qw-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(15,23,42,0.65)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "qwFadeIn 0.2s ease",
      }}
    >
      <div
        className="qw-modal-content"
        style={{
          background: "#fff",
          borderRadius: isMobile ? "24px 24px 0 0" : 24,
          width: "100%",
          maxWidth: 720,
          maxHeight: isMobile ? "85vh" : "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
          margin: isMobile ? "0" : "20px",
          position: isMobile ? "fixed" : "relative",
          bottom: isMobile ? 0 : "auto",
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
        <div
          className="qw-modal-header"
          style={{
            padding: isMobile ? "16px 20px" : "24px 32px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, #f8fafc, #fff)",
            flexShrink: 0,
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: isMobile ? 40 : 48,
                height: isMobile ? 40 : 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: isMobile ? 18 : 20,
              }}
            >
              <FiZap />
            </div>
            <div>
              <h5
                style={{
                  margin: 0,
                  fontWeight: 800,
                  fontSize: isMobile ? 16 : 18,
                  color: "#0f172a",
                }}
              >
                Post a New Job
              </h5>
              {!isMobile && (
                <p style={{ margin: "2px 0 0", fontSize: 14, color: "#64748b" }}>
                  Connect with skilled providers instantly
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 12,
              width: 36,
              height: 36,
              cursor: "pointer",
              fontSize: 18,
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
          >
            <FiX />
          </button>
        </div>
        <div 
          className="qw-modal-body"
          style={{ 
            overflowY: "auto", 
            padding: isMobile ? "20px" : "32px",
            flexGrow: 1,
            scrollbarWidth: "none"
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className={`row ${isMobile ? 'g-3' : 'g-4'}`}>
              <div className="col-12">
                <FormInput
                  label="Job Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  placeholder="e.g. Build a responsive website"
                  icon={<FiBriefcase />}
                  required
                />
              </div>
              <div className="col-12">
                <FormTextarea
                  label="Job Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                  placeholder="Describe the tasks, expectations, and deliverables..."
                  rows={4}
                  icon={<FiAlignLeft />}
                  required
                />
              </div>
              <div className="col-12">
                <FormSelect
                  label="Service Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  error={errors.category}
                  options={categoryOptions}
                  placeholder="Select a category"
                  icon={<FiGrid />}
                  required
                />
              </div>
              <div className="col-md-6">
                <FormSelect
                  label="Select District"
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleChange}
                  error={errors.districtId}
                  options={locationOptions}
                  placeholder="Choose district"
                  icon={<FiMap />}
                  required
                />
              </div>
              <div className="col-md-6">
                <LocationAutocomplete
                  key={formData.districtId}
                  label="Search Detailed Location"
                  districtName={
                    locations.find((l) => l.id === formData.districtId)?.name ||
                    ""
                  }
                  center={
                    locations.find((l) => l.id === formData.districtId)?.center
                      ?.coordinates
                  }
                  onSelect={handleLocationSelect}
                  error={errors.selectedLocation as string}
                  helperText="Make sure your district is also visible in the selected location for a successful job posting."
                  disabled={!formData.districtId}
                  required
                />
              </div>
              <div className="col-12">
                <FormInput
                  label="Additional Location Details (Optional)"
                  name="additionalDetails"
                  value={formData.additionalDetails}
                  onChange={handleChange}
                  placeholder="e.g. Landmark, Floor number, House name..."
                  icon={<FiAlignLeft />}
                />
              </div>
              <div className="col-12">
                <FormInput
                  label="Contact Phone Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  error={errors.contactNumber}
                  placeholder="e.g. 9876543210"
                  icon={<FiPhone />}
                  required
                />
              </div>
              <div className="col-md-4">
                <FormSelect
                  label="Estimated Duration"
                  name="durationType"
                  value={formData.durationType}
                  onChange={handleChange}
                  options={durationOptions}
                  icon={<FiClock />}
                />
              </div>
              <div className="col-md-4">
                <FormInput
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  min={new Date().toISOString().split("T")[0]}
                  icon={<FiCalendar />}
                  required
                />
              </div>
              <div className="col-md-4">
                <FormInput
                  label="Freelancers Required"
                  name="freelancersNeeded"
                  type="number"
                  value={formData.freelancersNeeded}
                  onChange={handleChange}
                  error={errors.freelancersNeeded}
                  placeholder="1"
                  icon={<FiUsers />}
                  required
                />
              </div>
              <div className="col-md-6">
                <FormInput
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  error={errors.startTime}
                  icon={<FiClock />}
                  required
                />
              </div>
              <div className="col-md-6">
                <FormInput
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  error={errors.endTime}
                  icon={<FiClock />}
                  required
                />
              </div>
              {formData.durationType === "multi_day" && (
                <div className="col-12">
                  <FormInput
                    label="Number of Days"
                    name="days"
                    type="number"
                    value={formData.days}
                    onChange={handleChange}
                    error={errors.days}
                    placeholder="e.g. 5"
                    icon={<FiHash />}
                    required
                  />
                </div>
              )}
              <div className="col-md-6">
                <FormInput
                  label="Min Budget Per Provider (₹)"
                  name="minBudget"
                  type="number"
                  value={formData.minBudget}
                  onChange={handleChange}
                  error={errors.minBudget}
                  placeholder="0"
                  icon={<FiDollarSign />}
                  required
                />
              </div>
              <div className="col-md-6">
                <FormInput
                  label="Max Budget Per Provider (₹)"
                  name="maxBudget"
                  type="number"
                  value={formData.maxBudget}
                  onChange={handleChange}
                  error={errors.maxBudget}
                  placeholder="0"
                  icon={<FiDollarSign />}
                  required
                />
              </div>
              <div className="col-12 mt-3">
                <div style={{
                  padding: "20px",
                  background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>

                  

                  <div style={{ 
                    display: "flex", 
                    justifyContent: isMobile ? "center" : "space-between", 
                    alignItems: isMobile ? "flex-start" : "center",
                    flexDirection: isMobile ? "column" : "row",
                    gap: isMobile ? "12px" : "0"
                  }}>
                    <div style={{ textAlign: isMobile ? "center" : "left", width: isMobile ? "100%" : "auto" }}>
                      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Project Budget Range</span>
                      <div style={{ fontSize: isMobile ? "20px" : "24px", color: "#2563eb", fontWeight: 900 }}>
                        ₹{(Number(formData.minBudget) || 0) * (Number(formData.freelancersNeeded) || 1)} - ₹{(Number(formData.maxBudget) || 0) * (Number(formData.freelancersNeeded) || 1)}
                      </div>
                    </div>
                    <div style={{ 
                      padding: "8px 12px", 
                      background: "#dcfce7", 
                      color: "#15803d", 
                      borderRadius: "8px", 
                      fontSize: "12px", 
                      fontWeight: 700,
                      alignSelf: isMobile ? "center" : "auto"
                    }}>
                      {formData.freelancersNeeded || 1} Provider(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="qw-modal-actions"
              style={{
                marginTop: isMobile ? 24 : 32,
                paddingTop: isMobile ? 16 : 24,
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: isMobile ? "column-reverse" : "row",
                gap: 12,
                paddingBottom: isMobile ? "calc(12px + env(safe-area-inset-bottom))" : 0
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="btn py-3 px-4 flex-fill"
                style={{
                  borderRadius: 14,
                  background: "#f8fafc",
                  color: "#475569",
                  fontWeight: 600,
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s",
                  height: isMobile ? 54 : "auto"
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn py-3 px-4 flex-fill"
                style={{
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "#fff",
                  fontWeight: 700,
                  border: "none",
                  boxShadow: "0 8px 20px rgba(59,130,246,0.25)",
                  transition: "all 0.2s",
                  height: isMobile ? 54 : "auto"
                }}
              >
                {isSubmitting ? "Posting..." : "Post Job Now"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes qwFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes qwSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes qwMobileSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .qw-modal-content {
          animation: qwSlideUp 0.3s cubic-bezier(.34,1.56,.64,1);
        }

        @media (max-width: 768px) {
          .qw-modal-overlay {
            align-items: flex-end !important;
            padding: 0 !important;
          }
          .qw-modal-content {
            animation: qwMobileSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            border-radius: 24px 24px 0 0 !important;
            max-height: 90vh !important;
          }
          input, textarea, select {
            font-size: 16px !important; /* Prevent iOS zoom */
          }
          .qw-modal-body::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};
