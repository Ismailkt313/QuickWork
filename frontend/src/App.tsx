import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Routers from "./app/router/routers";
import AuthRouter from "./app/router/AuthRouter";
import AdminRouter from "./app/router/AdminRouter";
import ProviderRouter from "./app/router/ProviderRouter";
import UserRouter from "./app/router/UserRouter";

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2500} />

      <Routes>
        <Route path="*" element={<Routers />} />

        <Route path="/auth/*" element={<AuthRouter />} />

        <Route path="/admin/*" element={<AdminRouter />} />

        <Route path="/provider/*" element={<ProviderRouter />} />

        <Route path="/user/*" element={<UserRouter />} />

        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
