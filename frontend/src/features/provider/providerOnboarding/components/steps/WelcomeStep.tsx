import React from "react";
import { useDispatch } from "react-redux";
import { setCurrentStep } from "../../../providerOnboarding/store/onboardingSlice";
import { 
  RiVerifiedBadgeFill, 
  RiMegaphoneFill, 
  RiMoneyDollarCircleFill, 
  RiTimeLine 
} from "react-icons/ri";

const WelcomeStep: React.FC = () => {
  const dispatch = useDispatch();

  const handleStart = () => {
    dispatch(setCurrentStep(1));
  };

  return (
    <div className="max-w-[900px] mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Build Your Professional Profile
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Join verified professionals and start receiving trusted client requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <RiVerifiedBadgeFill size={32} />
          </div>
          <h5 className="text-lg font-black text-slate-800 mb-3">Verified Badge</h5>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Get an exclusive badge that builds immediate trust with potential clients.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <RiMegaphoneFill size={32} />
          </div>
          <h5 className="text-lg font-black text-slate-800 mb-3">Direct Leads</h5>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Receive high-quality leads directly in your inbox without any bidding wars.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <RiMoneyDollarCircleFill size={32} />
          </div>
          <h5 className="text-lg font-black text-slate-800 mb-3">Flexible Earnings</h5>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Set your own rates and keep 100% of what you earn with zero hidden fees.
          </p>
        </div>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">
          <RiTimeLine size={16} />
          <span>Takes 5–7 minutes</span>
        </div>
        <button
          onClick={handleStart}
          className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
        >
          Start Application
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
