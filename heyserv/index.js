const express = require("express");
const app = express();
const PORT = 3001;
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");

const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_BACKEND_CLIENT_ID = process.env.KEYCLOAK_BACKEND_CLIENT_ID;
const KEYCLOAK_BACKEND_CLIENT_SECRET = process.env.KEYCLOAK_BACKEND_CLIENT_SECRET;

const KEYCLOAK_JWKS_URI = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`;
const client = jwksClient({
  jwksUri: KEYCLOAK_JWKS_URI,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

// Middleware to validate Keycloak access token
function validateKeycloakToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Malformed token" });

  jwt.verify(token, getKey, {}, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token", details: err.message });
    req.user = decoded;
    next();
  });
}

// Function to get Keycloak admin access token
async function getKeycloakAdminToken() {
  const tokenUrl = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
  const params = new URLSearchParams();
  params.append("client_id", KEYCLOAK_BACKEND_CLIENT_ID);
  params.append("client_secret", KEYCLOAK_BACKEND_CLIENT_SECRET);
  params.append("grant_type", "client_credentials");

  const response = await axios.post(tokenUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data.access_token;
}

// Function to get user's federated Google identity from Keycloak
async function getUserGoogleFederatedIdentity(userId, adminToken) {
  const url = `${KEYCLOAK_BASE_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/federated-identity`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  // Find the Google federated identity in the array
  const googleIdentity = response.data.find((identity) => identity.identityProvider === "google");
  return googleIdentity;
}

// Example protected route
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json()); // <-- Add this to parse JSON bodies

app.get("/email", validateKeycloakToken, async (req, res) => {
  try {
    // 1. Get admin token
    const adminToken = await getKeycloakAdminToken();
    // decode and print the admin token
    const decodedAdminToken = jwt.decode(adminToken);
    console.log("decodedAdminToken", decodedAdminToken);
    // 2. Get userId from access token (sub claim)
    const userId = req.user.sub;
    // 3. Fetch federated Google identity
    const federatedIdentity = await getUserGoogleFederatedIdentity(userId, adminToken);
    // 4. Return federated identity (including Google access token)
    res.json({ federatedIdentity });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Google federated identity", details: err.message });
  }
});

// POST /email/send — Send email
app.post("/email/send", validateKeycloakToken, async (req, res) => {
  try {
    const adminToken = await getKeycloakAdminToken();
    const userId = req.user.sub;
    const federatedIdentity = await getUserGoogleFederatedIdentity(userId, adminToken);
    const googleAccessToken = federatedIdentity.token;

    // TODO: Use googleAccessToken to send email via Gmail API
    // Example: req.body should contain { to, subject, body }
    // Placeholder response:
    res.json({ message: "Email sent (placeholder)", to: req.body.to, subject: req.body.subject });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email", details: err.message });
  }
});

// POST /email/summarize — Summarize email (AI)
app.post("/email/summarize", validateKeycloakToken, async (req, res) => {
  // TODO: Integrate with AI summarization service
  res.json({ summary: "This is a placeholder summary." });
});

// POST /email/draft-reply — Draft reply (AI)
app.post("/email/draft-reply", validateKeycloakToken, async (req, res) => {
  // TODO: Integrate with AI reply drafting service
  res.json({ draft: "This is a placeholder draft reply." });
});

app.get("/", (req, res) => {
  res.send("Heymail backend running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
