import React from "react";
import ProviderAvailability from "../components/ProviderAvailability";
import { RiCalendarEventLine, RiInformationLine } from "react-icons/ri";

const AvailabilityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Availability</h1>
            <p className="text-slate-500 mt-1 font-medium">Control when you are available to receive job invitations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-blue-200 mb-4">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-black mb-2">Work Schedule</h2>
                <p className="text-blue-100 font-medium">
                  Set your recurring weekly hours and block specific dates for leave. 
                  Clients will only see you as available during these times.
                </p>
              </div>
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <RiCalendarEventLine size={40} />
              </div>
            </div>
            {}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <div className="mb-6 p-4 bg-amber-50 rounded-xl flex gap-3 border border-amber-100">
                <RiInformationLine className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                  Pro-tip: Providers with accurate availability schedules have a 40% higher acceptance rate and receive more direct invitations.
                </p>
              </div>
            <ProviderAvailability />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
