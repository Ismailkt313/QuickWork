import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../../app/store";
import {
  addSkill,
  removeSkill,
  setHourlyRate,
  setLocation,
  setCurrentStep,
} from "../../../providerOnboarding/store/onboardingSlice";
import {
  searchSkills,
  requestSkill,
} from "../../../../user/serviceProviders/services/skills.service";
import {
  getLocations,
  type Location,
} from "../../../../location/services/location.service";
import { debounce } from "../../../../../utils/debounce";
import { 
  RiSearchLine, 
  RiCloseLine, 
  RiAddLine, 
  RiTimeLine, 
  RiMapPinLine, 
  RiArrowLeftLine, 
  RiArrowRightLine,
  RiHammerFill
} from "react-icons/ri";

const SkillsStep: React.FC = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state: RootState) => state.onboarding);

  const [skillQuery, setSkillQuery] = useState("");
  const [skillResults, setSkillResults] = useState<{ id: string; name: string }[]>([]);
  const [isSearchingSkills, setIsSearchingSkills] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillInputRef = useRef<HTMLDivElement>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");

  const isValid =
    (formData.skills?.length || 0) >= 1 &&
    (formData.hourlyRate || 0) > 0 &&
    formData.location !== null;

  const fetchSkills = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query.trim()) {
          setSkillResults([]);
          setIsSearchingSkills(false);
          return;
        }
        setIsSearchingSkills(true);
        const results = await searchSkills(query);
        setSkillResults(results);
        setIsSearchingSkills(false);
      }, 280),
    [],
  );

  const handleAddSkill = (skill: { id: string; name: string }) => {
    dispatch(addSkill(skill));
    setSkillQuery("");
    setSkillResults([]);
    setShowSkillDropdown(false);
  };

  const handleRequestSkill = async () => {
    if (!skillQuery.trim()) return;
    const result = await requestSkill(skillQuery);
    if (result.success) {
      dispatch(
        addSkill({
          id: `req_${Date.now()}`,
          name: skillQuery,
          isRequested: true,
        }),
      );
      setSkillQuery("");
      setSkillResults([]);
      setShowSkillDropdown(false);
    }
  };

  useEffect(() => {
    const loadLocations = async () => {
      const res = await getLocations();
      if (res.success) {
        setLocations(res.data);
        if (formData.location?.id) {
          setSelectedLocationId(formData.location.id);
        }
      }
    };
    loadLocations();
  }, [formData.location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (skillInputRef.current && !skillInputRef.current.contains(e.target as Node)) {
        setShowSkillDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const reachedLimit = (formData.skills?.length || 0) >= 10;

  return (
    <div className="max-w-[680px] mx-auto py-6">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Define Your Expertise</h2>
          <p className="text-slate-500 font-medium text-sm">Help clients understand what you offer and where you work.</p>
        </div>

        <div className="space-y-10">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
              Skills & Expertise
            </label>

            <div ref={skillInputRef} className="relative">
              <div
                className={`flex items-center gap-3 px-5 rounded-2xl border-2 transition-all min-h-[56px] ${
                  showSkillDropdown ? "border-blue-400 bg-white ring-4 ring-blue-50" : "border-slate-100 bg-slate-50"
                } ${reachedLimit ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <RiSearchLine className="text-slate-400" size={18} />
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium py-3"
                  placeholder={reachedLimit ? "Maximum 10 skills reached" : "Search skills (e.g. Plumbing, Cleaning…)"}
                  value={skillQuery}
                  disabled={reachedLimit}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSkillQuery(val);
                    if (val.trim()) {
                      setIsSearchingSkills(true);
                      fetchSkills(val);
                    } else {
                      setSkillResults([]);
                      setIsSearchingSkills(false);
                    }
                    if (!showSkillDropdown) setShowSkillDropdown(true);
                  }}
                  onFocus={() => setShowSkillDropdown(true)}
                />
                {isSearchingSkills && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
                {skillQuery && !isSearchingSkills && (
                  <button type="button" onClick={() => { setSkillQuery(""); setSkillResults([]); }} className="text-slate-400 hover:text-slate-600">
                    <RiCloseLine size={20} />
                  </button>
                )}
              </div>

              {showSkillDropdown && skillQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                    {isSearchingSkills ? (
                      <div className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                        Scanning Skills Database…
                      </div>
                    ) : skillResults.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {skillResults
                          .filter((s) => !formData.skills?.some((fs) => fs.id === s.id))
                          .map((skill) => (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => handleAddSkill(skill)}
                              className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                            >
                              <div className="w-9 h-9 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                <RiHammerFill size={18} />
                              </div>
                              <span className="font-bold text-slate-700 capitalize text-sm">{skill.name}</span>
                              <div className="ml-auto flex items-center gap-1 text-[10px] font-black text-slate-300 uppercase group-hover:text-blue-600">
                                <RiAddLine size={14} />
                                <span>Add</span>
                              </div>
                            </button>
                          ))}
                        <div className="p-3 border-t border-slate-50 mt-1">
                          <button
                            type="button"
                            onClick={handleRequestSkill}
                            className="flex items-center gap-3 w-full p-3 rounded-xl bg-blue-50/50 text-blue-600 hover:bg-blue-50 transition-colors group"
                          >
                            <RiAddLine size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-widest">
                              Request \"{skillQuery}\"
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-10 text-center">
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">
                          No direct matches for \"{skillQuery}\"
                        </p>
                        <button
                          type="button"
                          onClick={handleRequestSkill}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700"
                        >
                          Propose as new skill
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {(formData.skills?.length || 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 px-1">
                {formData.skills?.map((skill) => (
                  <div
                    key={skill.name}
                    className={`group flex items-center gap-2 py-2 pl-4 pr-3 rounded-xl border transition-all ${
                      skill.isRequested
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-tight">{skill.name}</span>
                    {skill.isRequested && (
                      <RiTimeLine className="text-amber-500" size={14} title="Pending Verification" />
                    )}
                    <button
                      onClick={() => dispatch(removeSkill(skill.name))}
                      className="text-current opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <RiCloseLine size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="px-1 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                {formData.skills?.length || 0}/10 Expertises
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-tight">Min. 1 required</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
              Service Value (Hourly)
            </label>
            <div className="relative max-w-[240px]">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">₹</div>
              <input
                type="number"
                className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold text-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300"
                placeholder="e.g. 500"
                value={formData.hourlyRate || ""}
                onChange={(e) => dispatch(setHourlyRate(Number(e.target.value)))}
                min="1"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium px-1">Set a competitive rate based on your market level.</p>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
              Primary Service Region
            </label>
            <div className="relative group">
              <RiMapPinLine className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={18} />
              <select
                className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold text-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none appearance-none transition-all cursor-pointer"
                value={selectedLocationId}
                onChange={(e) => {
                  const loc = locations.find((l) => String(l.id) === e.target.value);
                  setSelectedLocationId(e.target.value);
                  dispatch(setLocation(loc ? { name: loc.name, id: loc.id } : null));
                }}
              >
                <option value="">Select Target District</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-16 pt-8 border-t border-slate-100">
          <button
            onClick={() => dispatch(setCurrentStep(1))}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-widest transition-colors"
          >
            <RiArrowLeftLine size={18} />
            Back
          </button>
          <button
            disabled={!isValid}
            onClick={() => dispatch(setCurrentStep(3))}
            className="flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
          >
            Confirm & Review
            <RiArrowRightLine size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsStep;
