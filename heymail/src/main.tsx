import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import keycloak from "./keycloak";
import App from "./App.tsx";
import { ReactKeycloakProvider } from "@react-keycloak/web";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <ReactKeycloakProvider authClient={keycloak} initOptions={{ onLoad: "check-sso", checkLoginIframe: false }}>
    <App />
    {/* <div>Hello World</div> */}
  </ReactKeycloakProvider>
  // </StrictMode>
);
