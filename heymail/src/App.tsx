import { useKeycloak } from "@react-keycloak/web";
import { useEffect } from "react";

const App = () => {
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    console.log("Keycloak state after login:", {
      initialized,
      authenticated: keycloak.authenticated,
      token: keycloak.token,
      idToken: keycloak.idToken,
      parsedToken: keycloak.tokenParsed,
    });
  }, [initialized, keycloak]);

  if (!initialized) {
    return <div>Loading...</div>;
  }

  console.log("keycloak", keycloak);

  return (
    <div>
      {keycloak.authenticated ? (
        <div>
          <p>Logged in as: {keycloak.tokenParsed?.email || keycloak.tokenParsed?.preferred_username}</p>
          <button onClick={() => keycloak.logout()}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Not logged in</p>
          <button onClick={() => keycloak.login()}>Login</button>
        </div>
      )}
    </div>
  );
};

export default App;
