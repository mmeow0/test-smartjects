import { createThirdwebClient, CreateThirdwebClientOptions } from "thirdweb";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
} as CreateThirdwebClientOptions);
