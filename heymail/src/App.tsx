import { useKeycloak } from "@react-keycloak/web";

const App = () => {
  const { keycloak, initialized } = useKeycloak();

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
