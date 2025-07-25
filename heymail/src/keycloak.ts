import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || "https://keycloak.dserv.io:8082/",
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "heymail",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "heymail-react-test",
});

console.log("created keycloak", keycloak);

export default keycloak;
