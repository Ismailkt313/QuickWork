import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { Location } from ".././landingPage/services/landingService";

import MobileBottomNav from "../components/MobileBottomNav";

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
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 992);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header
        locations={locations}
        selectedLocation={selectedLocation}
        onSelectLocation={onSelectLocation}
        onClearLocation={onClearLocation}
      />
      <main 
        style={{ 
          flex: 1,
          paddingBottom: isMobile ? "calc(74px + env(safe-area-inset-bottom, 12px))" : 0
        }}
      >
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
