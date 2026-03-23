
interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {

    if (currentStep === 0) return null;

    return (
        <div className="container mt-4 mb-4" style={{ maxWidth: "700px" }}>
            <div className="text-center mb-3">
                <span className="badge bg-primary rounded-pill px-3 py-2 mb-2">Step {currentStep} of {totalSteps - 1}</span>
                <h6 className="text-secondary fw-bold text-uppercase" style={{ letterSpacing: '1px', fontSize: '10px' }}>Application Progress</h6>
            </div>
            <div className="progress" style={{ height: "6px", backgroundColor: "#e9ecef" }}>
                <div
                    className="progress-bar bg-primary rounded-pill transition-all"
                    role="progressbar"
                    style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%`, transition: 'width 0.5s ease' }}
                ></div>
            </div>
        </div>
    );
};

export default StepIndicator;
