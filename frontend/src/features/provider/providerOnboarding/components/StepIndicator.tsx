interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  if (currentStep === 0) return null;

  const progressPercentage = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="max-w-[680px] mx-auto mt-4 mb-8">
      <div className="text-center mb-6 flex flex-col items-center gap-2">
        <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase">
          Step {currentStep} of {totalSteps - 1}
        </span>
        <h6 className="text-slate-400 font-bold text-[10px] uppercase tracking-[2px]">
          Application Progress
        </h6>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepIndicator;
