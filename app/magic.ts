'use client'
import { Magic} from "magic-sdk"
import { createWalletClient, custom, encodeFunctionData  } from "viem";
import { WalletClientSigner, type SmartAccountSigner } from "@alchemy/aa-core";

const MAGIC_API_KEY = "pk_live_F64111E61712EA67";

export const createMagic = () => {
  return typeof window != 'undefined' && new Magic(MAGIC_API_KEY, {network: {chainId: 80001, rpcUrl: "https://polygon-mumbai.g.alchemy.com/v2/xmRUAnX3GqNl962NVIensu3G1vAEHCs2"}});
};

export const magicInstance = createMagic();

export const createMagicSigner = async () => {
  if (typeof window === "undefined" || !magicInstance) { /* we're on the server */ return }
  // 1. Authenticate the user (for other methods see magic docs https://magic.link/docs/dedicated/overview)
  const addresses = await magicInstance.wallet.connectWithUI();
  console.log(addresses);
  console.log(magicInstance);
  // 2. create a wallet client
  const magicClient = createWalletClient({
    transport: custom(await magicInstance.wallet.getProvider()),
  });

  return new WalletClientSigner(
    magicClient,
    "magic" // signerType
  );
};

export const logoutMagic = async () => {
  if (typeof window === "undefined" || !magicInstance) { /* we're on the server */ return }
  console.log(magicInstance);
  await magicInstance.user.logout();
}