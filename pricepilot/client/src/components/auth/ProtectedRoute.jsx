import { useCallback, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { LoaderCircle, RefreshCw } from "lucide-react";
import api from "../../services/api";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking");

  const verifySession = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setStatus("unauthenticated");
      return;
    }

    setStatus("checking");
    try {
      await api.get("/profile");
      setStatus("authenticated");
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setStatus("unauthenticated");
      } else {
        // A network/API outage is not proof that the user's token is invalid.
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  if (status === "checking") {
    return (
      <main className="pp-route-loading" role="status" aria-live="polite">
        <LoaderCircle size={22} className="pp-spin" />
        <span>Securing your workspace…</span>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="pp-route-loading" role="alert">
        <strong>PricePilot is temporarily unavailable.</strong>
        <span>We couldn't verify your session. Your sign-in has not been cleared.</span>
        <button type="button" className="pp-secondary-button" onClick={verifySession}>
          <RefreshCw size={14}/> Try again
        </button>
      </main>
    );
  }

  if (status === "unauthenticated") return <Navigate to="/login" replace />;
  return <Outlet />;
}
