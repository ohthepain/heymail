set -a
. ../.env
set +a

source ./get-admin-token.sh

# KEYCLOAK_USERID=6386176d-12af-46e9-b2ec-7c13ba22524e

# echo $KEYCLOAK_TOKEN

PAYLOAD=$(echo $KEYCLOAK_TOKEN | cut -d '.' -f2)
# Add padding if needed
while [ $((${#PAYLOAD} % 4)) -ne 0 ]; do PAYLOAD="${PAYLOAD}="; done
echo $PAYLOAD | base64 -d | jq .

echo "KEYCLOAK_USERID: $KEYCLOAK_USERID"

# curl -H "Authorization: Bearer $KEYCLOAK_TOKEN" \
#   "https://keycloak.dserv.io:8082/admin/realms/heymail/users/$KEYCLOAK_USERID/federated-identity/google"

curl -H "Authorization: Bearer $KEYCLOAK_TOKEN" \
  "https://keycloak.dserv.io:8082/admin/realms/heymail/users/$KEYCLOAK_USERID/federated-identity"
