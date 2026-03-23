import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { Location } from '.././landingPage/services/landingService';

interface MainLayoutProps {
  children: React.ReactNode;
  locations?: Location[];
  selectedLocation?: Location | null;
  onSelectLocation?: (location: Location) => void;
  onClearLocation?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  locations,
  selectedLocation,
  onSelectLocation,
  onClearLocation,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        locations={locations}
        selectedLocation={selectedLocation}
        onSelectLocation={onSelectLocation}
        onClearLocation={onClearLocation}
      />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
