import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BackNavigationHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure we have an extra history entry so a back gesture doesn't immediately exit the app.
    try {
      window.history.replaceState({ appGuard: true }, "");
      window.history.pushState({ appGuard: true }, "");
    } catch (e) {
      // ignore if history manipulation not allowed
    }

    const onPopState = () => {
      const path = window.location.pathname;
      if (path === "/" || path === "" || path === "/install") {
        // Navigate to home instead of letting the OS/browser exit the app
        navigate("/home", { replace: true });
        // Reinsert the guard state so future back gestures remain in-app
        try {
          window.history.pushState({ appGuard: true }, "");
        } catch (e) {}
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [location.pathname, navigate]);

  return null;
};

export default BackNavigationHandler;
