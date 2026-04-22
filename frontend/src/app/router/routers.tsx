import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import FallbackScreen from "../../components/ui/FallbackScreen";

const LandingPage = lazy(
  () => import("../../features/user/landingPage/page/LandingPage"),
);
const Routers = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<FallbackScreen />}>
            <LandingPage />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default Routers;
