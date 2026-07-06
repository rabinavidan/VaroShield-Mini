import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import FilesPage from "./pages/FilesPage";
import LoginPage from "./pages/LoginPage";
import RisksPage from "./pages/RisksPage";
import { useIsAuthenticated } from "./auth";

function RequireAuth({ children }: { children: JSX.Element }) {
  const authenticated = useIsAuthenticated();
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const authenticated = useIsAuthenticated();

  return (
    <>
      {authenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/files"
          element={
            <RequireAuth>
              <FilesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/risks"
          element={
            <RequireAuth>
              <RisksPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
