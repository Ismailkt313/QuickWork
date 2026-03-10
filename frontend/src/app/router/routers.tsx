import { Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"
import FallbackScreen from "../../components/FallbackScreen"

const LandingPage = lazy(() => import("../../pages/LandingPage"))
const Routers = () => {
  return (
    <Routes>
      <Route path="" element={
        <Suspense fallback={<FallbackScreen />}>
          <LandingPage />
        </Suspense>
      } />
          
    </Routes>
  )
}

export default Routers
