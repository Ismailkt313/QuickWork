import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "provider_onboarding";
const EXPIRY_TIME = 1000 * 60 * 60;

const saveWithExpiry = (key: string, value: any) => {
  const item = {
    data: value,
    expiry: Date.now() + EXPIRY_TIME,
  };

  localStorage.setItem(key, JSON.stringify(item));
};

const loadWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);

  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);

    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const removeStorage = (key: string) => {
  localStorage.removeItem(key);
};

interface Skill {
  id: string;
  name: string;
  isRequested?: boolean;
}

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  images: string[];
}

interface Location {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
}

interface OnboardingState {
  currentStep: number;
  formData: {
    profileImage: string;
    headline: string;
    about: string;
    yearsOfExperience: number;
    phone: string;
    skills: Skill[];
    hourlyRate: number;
    location: Location | null;
    portfolio: PortfolioProject[];
    agreedToTerms: boolean;
  };
}

const savedState = loadWithExpiry(STORAGE_KEY);

const initialState: OnboardingState = savedState || {
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

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      saveWithExpiry(STORAGE_KEY, state);
    },

    updateField: (
      state,
      action: PayloadAction<{
        field: keyof OnboardingState["formData"];
        value: any;
      }>,
    ) => {
      (state.formData as any)[action.payload.field] = action.payload.value;
      saveWithExpiry(STORAGE_KEY, state);
    },

    addSkill: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        isRequested?: boolean;
      }>,
    ) => {
      const exists = state.formData.skills.find(
        (s) => s.name === action.payload.name,
      );

      if (!exists && state.formData.skills.length < 10) {
        state.formData.skills.push(action.payload);
        saveWithExpiry(STORAGE_KEY, state);
      }
    },

    removeSkill: (state, action: PayloadAction<string>) => {
      state.formData.skills = state.formData.skills.filter(
        (s) => s.name !== action.payload,
      );
      saveWithExpiry(STORAGE_KEY, state);
    },

    setHourlyRate: (state, action: PayloadAction<number>) => {
      state.formData.hourlyRate = action.payload;
      saveWithExpiry(STORAGE_KEY, state);
    },

    setLocation: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        lat?: number;
        lon?: number;
      } | null>,
    ) => {
      state.formData.location = action.payload;
      saveWithExpiry(STORAGE_KEY, state);
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

      removeStorage(STORAGE_KEY);
    },

    addPortfolioProject: (
      state,
      action: PayloadAction<{
        id: string;
        title: string;
        description: string;
        images: string[];
      }>,
    ) => {
      state.formData.portfolio.push(action.payload);
      saveWithExpiry(STORAGE_KEY, state);
    },

    removePortfolioProject: (state, action: PayloadAction<string>) => {
      state.formData.portfolio = state.formData.portfolio.filter(
        (p) => p.id !== action.payload,
      );
      saveWithExpiry(STORAGE_KEY, state);
    },

    updatePortfolioProject: (
      state,
      action: PayloadAction<{ id: string; title: string; description: string }>,
    ) => {
      const project = state.formData.portfolio.find(
        (p) => p.id === action.payload.id,
      );

      if (project) {
        project.title = action.payload.title;
        project.description = action.payload.description;
        saveWithExpiry(STORAGE_KEY, state);
      }
    },

    addPortfolioImage: (
      state,
      action: PayloadAction<{ projectId: string; image: string }>,
    ) => {
      const project = state.formData.portfolio.find(
        (p) => p.id === action.payload.projectId,
      );

      if (project) {
        project.images.push(action.payload.image);
        saveWithExpiry(STORAGE_KEY, state);
      }
    },

    removePortfolioImage: (
      state,
      action: PayloadAction<{ projectId: string; imageIndex: number }>,
    ) => {
      const project = state.formData.portfolio.find(
        (p) => p.id === action.payload.projectId,
      );

      if (project) {
        project.images.splice(action.payload.imageIndex, 1);
        saveWithExpiry(STORAGE_KEY, state);
      }
    },

    setAgreedToTerms: (state, action: PayloadAction<boolean>) => {
      state.formData.agreedToTerms = action.payload;
      saveWithExpiry(STORAGE_KEY, state);
    },
  },
});

export const {
  setCurrentStep,
  updateField,
  addSkill,
  removeSkill,
  setHourlyRate,
  setLocation,
  resetOnboarding,
  addPortfolioProject,
  removePortfolioProject,
  updatePortfolioProject,
  addPortfolioImage,
  removePortfolioImage,
  setAgreedToTerms,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
