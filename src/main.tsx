import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installFetchRetry } from "./lib/fetchRetry";

installFetchRetry();

createRoot(document.getElementById("root")!).render(<App />);
