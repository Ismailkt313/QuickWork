import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLandingData } from '../../hooks/useLandingData';
import MainLayout from '../../layout/MainLayout';
import HeroSection from '../components/HeroSecotion';
import ServiceSection from '../components/ServiceSection';
import HowItWorks from '../components/HowItWorks';
import CallToAction from '../components/CallToAction';
import LocationModal from '../components/LocationModal';
import type { Location, Skill } from '../services/landingService';

const LandingPage: React.FC = () => {
  const {
    skills, locations, loading, error,
    selectedLocation, selectLocation, clearLocation,
  } = useLandingData();

  const navigate = useNavigate();
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  const handleSkillClick = (skill: Skill) => {
    navigate(`/user/services/${skill._id}?name=${encodeURIComponent(skill.name)}`);
  };

  const handleSelectLocation = (loc: Location) => {
    selectLocation(loc);
    setServiceModalOpen(false); 
  };

  return (
    <MainLayout
      locations={locations}
      selectedLocation={selectedLocation}
      onSelectLocation={selectLocation}
      onClearLocation={clearLocation}
    >
      <HeroSection />

      <ServiceSection
        skills={skills}
        loading={loading}
        error={error}
        selectedLocation={selectedLocation}
        onOpenLocationModal={() => setServiceModalOpen(true)}
        onClearLocation={clearLocation}
        onSkillClick={handleSkillClick}
      />

      <HowItWorks />
      <CallToAction />

      <LocationModal
        isOpen={serviceModalOpen}
        locations={locations}
        selectedLocationId={selectedLocation?._id}
        onSelect={handleSelectLocation}
        onClose={() => setServiceModalOpen(false)}
      />
    </MainLayout>
  );
};

export default LandingPage;