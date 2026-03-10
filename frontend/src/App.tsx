import { BrowserRouter, Routes, Route } from "react-router-dom"
import Routers from "./app/router/routers"

import AuthRouter from "./app/router/AuthRouter"
import AdminRouter from "./app/router/AdminRouter"
import ProviderRouter from "./app/router/ProviderRouter"
import UserRouter from "./app/router/UserRouter"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Routers />} />

        <Route path="/auth/*" element={<AuthRouter />} />

        <Route path="/admin/*" element={<AdminRouter />} />

        <Route path="/provider/*" element={<ProviderRouter />} />

        <Route path="/user/*" element={<UserRouter />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App