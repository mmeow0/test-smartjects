import { createThirdwebClient } from "thirdweb";

// Validate environment variables
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
  console.error(
    "❌ NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set in environment variables",
  );
  throw new Error(
    "ThirdWeb client ID is required. Please set NEXT_PUBLIC_THIRDWEB_CLIENT_ID in your .env.local file",
  );
}

console.log(
  "✅ Initializing ThirdWeb client with ID:",
  clientId.slice(0, 8) + "...",
);

export const client = createThirdwebClient({
  clientId: clientId,
});

console.log("✅ ThirdWeb client initialized successfully");
