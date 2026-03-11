import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface OnboardingState {
    currentStep: number;
    formData: {
        profileImage: string;
        headline: string;
        about: string;
        yearsOfExperience: number;
        phone: string;
        skills: { id: string; name: string; isRequested?: boolean }[];
        hourlyRate: number;
        location: { id: string; name: string; lat: number; lon: number } | null;
        portfolio: {
            id: string;
            title: string;
            description: string;
            images: string[];
        }[];
        agreedToTerms: boolean;
    };
}

const AccessTokenKey = localStorage.getItem("token") || null;

const STORAGE_KEY = `provider_onboarding_state${AccessTokenKey ? `_${AccessTokenKey}` : ""}`;
const loadState = (): OnboardingState => {
    try {
        const serializedState = localStorage.getItem(STORAGE_KEY);
        const defaultState: OnboardingState = {
            currentStep: 0,
            formData: {
                profileImage: "",
                headline: "",
                about: "",
                yearsOfExperience: 0,
                phone: "",
                skills: [],
                hourlyRate: 0,
                location: null,
                portfolio: [],
                agreedToTerms: false,
            },
        };

        if (serializedState === null) {
            return defaultState;
        }

        const savedState = JSON.parse(serializedState);
        return {
            ...defaultState,
            ...savedState,
            formData: {
                ...defaultState.formData,
                ...savedState.formData
            }
        };
    } catch (err) {
        return {
            currentStep: 0,
            formData: {
                profileImage: "",
                headline: "",
                about: "",
                yearsOfExperience: 0,
                phone: "",
                skills: [],
                hourlyRate: 0,
                location: null,
                portfolio: [],
                agreedToTerms: false,
            },
        };
    }
};

const initialState: OnboardingState = loadState();

const onboardingSlice = createSlice({
    name: "onboarding",
    initialState,
    reducers: {
        setCurrentStep: (state, action: PayloadAction<number>) => {
            state.currentStep = action.payload;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },
        updateField: (
            state,
            action: PayloadAction<{ field: keyof OnboardingState["formData"]; value: any }>
        ) => {
            (state.formData as any)[action.payload.field] = action.payload.value;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },
        addSkill: (state, action: PayloadAction<{ id: string; name: string; isRequested?: boolean }>) => {
            const exists = state.formData.skills.find(s => s.name === action.payload.name);
            if (!exists && state.formData.skills.length < 10) {
                state.formData.skills.push(action.payload);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
        },
        removeSkill: (state, action: PayloadAction<string>) => {
            state.formData.skills = state.formData.skills.filter(s => s.name !== action.payload);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },
        setHourlyRate: (state, action: PayloadAction<number>) => {
            state.formData.hourlyRate = action.payload;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },
        setLocation: (state, action: PayloadAction<{ id: string; name: string; lat: number; lon: number } | null>) => {
            state.formData.location = action.payload;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },
        resetOnboarding: (state) => {
            state.currentStep = 0;
            state.formData = {
                profileImage: "",
                headline: "",
                about: "",
                yearsOfExperience: 0,
                phone: "",
                skills: [],
                hourlyRate: 0,
                location: null,
                portfolio: [],
                agreedToTerms: false,
            };
            localStorage.removeItem(STORAGE_KEY);
        },
        addPortfolioProject: (state, action: PayloadAction<{ id: string; title: string; description: string; images: string[] }>) => {
            state.formData.portfolio.push(action.payload);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },
        removePortfolioProject: (state, action: PayloadAction<string>) => {
            state.formData.portfolio = state.formData.portfolio.filter(p => p.id !== action.payload);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },
        updatePortfolioProject: (state, action: PayloadAction<{ id: string; title: string; description: string }>) => {
            const project = state.formData.portfolio.find(p => p.id === action.payload.id);
            if (project) {
                project.title = action.payload.title;
                project.description = action.payload.description;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
        },
        addPortfolioImage: (state, action: PayloadAction<{ projectId: string; image: string }>) => {
            const project = state.formData.portfolio.find(p => p.id === action.payload.projectId);
            if (project) {
                project.images.push(action.payload.image);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
        },
        removePortfolioImage: (state, action: PayloadAction<{ projectId: string; imageIndex: number }>) => {
            const project = state.formData.portfolio.find(p => p.id === action.payload.projectId);
            if (project) {
                project.images.splice(action.payload.imageIndex, 1);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
        },
        setAgreedToTerms: (state, action: PayloadAction<boolean>) => {
            state.formData.agreedToTerms = action.payload;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },
    },
});

export const {
    setCurrentStep,
    updateField,
    resetOnboarding,
    addSkill,
    removeSkill,
    setHourlyRate,
    setLocation,
    addPortfolioProject,
    removePortfolioProject,
    updatePortfolioProject,
    addPortfolioImage,
    removePortfolioImage,
    setAgreedToTerms
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
