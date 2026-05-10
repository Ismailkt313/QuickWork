import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import FallbackScreen from "../../../components/ui/FallbackScreen";

const HelpLandingPage = lazy(() => import("../pages/HelpLandingPage"));
const ClientGuidePage = lazy(() => import("../pages/ClientGuidePage"));
const ProviderGuidePage = lazy(() => import("../pages/ProviderGuidePage"));

const GettingStartedPage = lazy(() => import("../pages/GettingStartedPage"));
const PaymentsHelpPage = lazy(() => import("../pages/PaymentsHelpPage"));
const SafetyHelpPage = lazy(() => import("../pages/SafetyHelpPage"));
const FAQPage = lazy(() => import("../pages/FAQPage"));

const HelpCenterRouter = () => {
  return (
    <Suspense fallback={<FallbackScreen />}>
      <Routes>
        <Route index element={<HelpLandingPage />} />
        <Route path="getting-started" element={<GettingStartedPage />} />
        <Route path="client-guide" element={<ClientGuidePage />} />
        <Route path="provider-guide" element={<ProviderGuidePage />} />
        <Route path="payments" element={<PaymentsHelpPage />} />
        <Route path="safety" element={<SafetyHelpPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="messaging" element={<ClientGuidePage />} /> {/* Covered in Client Guide */}
      </Routes>
    </Suspense>
  );
};

export default HelpCenterRouter;
