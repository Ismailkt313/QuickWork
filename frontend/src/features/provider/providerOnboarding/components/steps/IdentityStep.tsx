import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../../app/store";
import {
  updateField,
  setCurrentStep,
} from "../../../providerOnboarding/store/onboardingSlice";
import { toast } from "react-toastify";
import { cloudinaryService } from "../../../../../services/cloudinaryService";
import { 
  RiUserLine, 
  RiCameraLine, 
  RiArrowLeftLine, 
  RiArrowRightLine,
  RiPhoneLine,
  RiHistoryLine
} from "react-icons/ri";

const IdentityStep: React.FC = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state: RootState) => state.onboarding);
  const [imagePreview, setImagePreview] = useState<string | null>(
    formData.profileImage || null,
  );
  const [isUploading, setIsUploading] = useState(false);

  const isValidPhone = (phone: string) => {
    const cleaned = phone.trim();
    return /^[6-9]\d{9}$/.test(cleaned) && !/^0+$/.test(cleaned);
  };

  const isValid =
    formData.profileImage &&
    formData.headline.trim().length > 0 &&
    formData.about.trim().length >= 80 &&
    isValidPhone(formData.phone) &&
    formData.yearsOfExperience >= 0 &&
    !isUploading;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.warning("File size must be under 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const response = await cloudinaryService.uploadImage(file, "quickwork/profile-images");
      const secureImageUrl = response.secure_url;
      setImagePreview(secureImageUrl);
      dispatch(updateField({ field: "profileImage", value: secureImageUrl }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image securely.";
      console.error("Upload failed", error);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    dispatch(updateField({ field, value }));
  };

  const calculateProfileStrength = () => {
    let strength = 20;
    if (formData.profileImage) strength += 20;
    if (formData.headline.trim()) strength += 20;
    if (formData.about.trim().length >= 80) strength += 20;
    if (formData.phone.trim()) strength += 20;
    return strength;
  };

  return (
    <div className="max-w-[640px] mx-auto py-6">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center mb-10">
          Professional Identity
        </h2>

        <div className="mb-12">
          <div className="flex justify-between items-end mb-3 px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Profile Strength
            </span>
            <span className="text-sm font-black text-blue-600">
              {calculateProfileStrength()}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${calculateProfileStrength()}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-blue-300 transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <RiUserLine className="text-slate-300" size={48} />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <label
                htmlFor="profileImage"
                className="absolute -bottom-3 -right-3 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
              >
                <RiCameraLine size={20} />
                <input type="file" id="profileImage" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Professional Avatar
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
              Professional Headline
            </label>
            <input
              type="text"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold text-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300"
              placeholder="e.g. Master Plumber with 10+ Years Experience"
              value={formData.headline}
              onChange={(e) => handleInputChange("headline", e.target.value)}
            />
            <p className="text-[10px] text-slate-400 font-medium px-1">A short summary of what you do best.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
              About Your Expertise
            </label>
            <textarea
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold text-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300 resize-none"
              rows={5}
              placeholder="Tell clients about your background, expertise, and what makes your service stand out..."
              value={formData.about}
              onChange={(e) => handleInputChange("about", e.target.value)}
            />
            <div className="flex justify-between items-center px-1">
              <span className={`text-[10px] font-bold ${formData.about.length < 80 ? "text-rose-500" : "text-emerald-600"}`}>
                {formData.about.length < 80 ? `Min. 80 chars (${80 - formData.about.length} more)` : "Length is perfect!"}
              </span>
              <span className="text-[10px] font-black text-slate-300 uppercase">{formData.about.length} Characters</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                Experience
              </label>
              <div className="relative">
                <RiHistoryLine className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold text-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none appearance-none transition-all"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange("yearsOfExperience", parseInt(e.target.value))}
                >
                  {[...Array(21)].map((_, i) => (
                    <option key={i} value={i}>{i === 20 ? "20+" : i} {i === 1 ? "Year" : "Years"}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                Direct Phone
              </label>
              <div className="relative">
                <RiPhoneLine className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="tel"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold text-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300"
                  placeholder="10-digit number"
                  value={formData.phone}
                  maxLength={10}
                  onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-16 pt-8 border-t border-slate-100">
          <button
            onClick={() => dispatch(setCurrentStep(0))}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-widest transition-colors"
          >
            <RiArrowLeftLine size={18} />
            Back
          </button>
          <button
            disabled={!isValid}
            onClick={() => dispatch(setCurrentStep(2))}
            className="flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
          >
            Next Phase
            <RiArrowRightLine size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdentityStep;
