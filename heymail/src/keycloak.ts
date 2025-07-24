import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://keycloak.dserv.io:8082/",
  realm: "heymail",
  clientId: "heymail-react-test",
});

console.log("created keycloak", keycloak);

export default keycloak;
