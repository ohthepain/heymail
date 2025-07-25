set -a
. ../.env
set +a

# Get the token and export as KEYCLOAK_TOKEN
response=$(curl -s -X POST "https://keycloak.dserv.io:8082/realms/heymail/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=$KEYCLOAK_BACKEND_CLIENT_ID" \
  -d "client_secret=$KEYCLOAK_BACKEND_CLIENT_SECRET" \
  -d "scope=openid email profile roles")

# echo $response

echo $response | jq -r .access_token


export KEYCLOAK_TOKEN=$(echo $response | jq -r .access_token)
export KEYCLOAK_USERID=$(echo $KEYCLOAK_TOKEN | cut -d '.' -f2 | base64 -d 2>/dev/null | jq -r .sub)
export KEYCLOAK_USERID="6386176d-12af-46e9-b2ec-7c13ba22524e"

echo "KEYCLOAK_BACKEND_CLIENT_ID: $KEYCLOAK_BACKEND_CLIENT_ID"
echo "KEYCLOAK_BACKEND_CLIENT_SECRET: $KEYCLOAK_BACKEND_CLIENT_SECRET"

echo "Successfully set KEYCLOAK_TOKEN" # to $KEYCLOAK_TOKEN"
echo "Successfully set KEYCLOAK_USERID to $KEYCLOAK_USERID"
