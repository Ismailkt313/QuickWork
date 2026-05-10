import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Routers from "./app/router/routers";
import AuthRouter from "./app/router/AuthRouter";
import AdminRouter from "./app/router/AdminRouter";
import ProviderRouter from "./app/router/ProviderRouter";
import UserRouter from "./app/router/UserRouter";
import HelpCenterRouter from "./features/helpCenter/router/HelpCenterRouter";

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={5}
        stacked
        toastStyle={{
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: "14px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        }}
        style={{ zIndex: 999999 }}
      />

      <Routes>
        <Route path="*" element={<Routers />} />

        <Route path="/auth/*" element={<AuthRouter />} />

        <Route path="/admin/*" element={<AdminRouter />} />

        <Route path="/provider/*" element={<ProviderRouter />} />

        <Route path="/user/*" element={<UserRouter />} />
        <Route path="/help-center/*" element={<HelpCenterRouter />} />

        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
