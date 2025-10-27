declare global {
  interface Window {
    ethereum?: any;
  }
}

import { BrowserProvider, Contract, parseUnits, type BigNumberish } from "ethers";
import { useMutation } from "@tanstack/react-query";

import CoreABI from "../contracts/abis/Core.json";
import ERC20ABI from "../contracts/abis/ERC20.json";

export type InvestArgs = {
  campaignId: string | number | bigint;
  amount: string; // siempre string para parseUnits
  addresses: {
    core: `0x${string}`;
    usdt: `0x${string}`;
  };
};

export type InvestResult = {
  approveTxHash?: string;
  contributeTxHash: string;
};

async function getProviderAndSigner() {
  if (!window.ethereum) throw new Error("No Ethereum provider found");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  return { provider, signer, account };
}

/**
 * Aprueba si allowance es insuficiente
 */
async function approveIfNeeded(
  tokenContract: Contract,
  owner: string,
  spender: string,
  amount: bigint
): Promise<string | undefined> {
  const allowance: bigint = await tokenContract.allowance(owner, spender);
  console.log("[DEBUG] Allowance actual:", allowance.toString(), "Amount requerido:", amount.toString());

  if (allowance >= amount) return undefined;

  console.log("[DEBUG] Enviando approve...");
  const tx = await tokenContract.approve(spender, amount);
  const receipt = await tx.wait();
  console.log("[DEBUG] Approve completado, txHash:", receipt.transactionHash);
  return receipt.transactionHash;
}

/**
 * Invierte asegurando decimales correctos
 */
async function performInvest({
  campaignId,
  amount,
  addresses,
}: InvestArgs): Promise<InvestResult> {
  const { provider, signer, account } = await getProviderAndSigner();

  const core = new Contract(addresses.core, CoreABI.abi ?? CoreABI, signer);
  const usdt = new Contract(addresses.usdt, ERC20ABI.abi ?? ERC20ABI, signer);

  // Leer decimales reales del token
  const decimals = await usdt.decimals();
  console.log("[DEBUG] Token decimals:", decimals);

  // Convertir amount de UI a base units según decimals reales
  const amountInBaseUnits: bigint = parseUnits(amount, decimals);
  console.log("[DEBUG] Amount en base units:", amountInBaseUnits.toString());

  // Aprobar si es necesario
  const approveTxHash = await approveIfNeeded(usdt, account, addresses.core, amountInBaseUnits);
  console.log("[DEBUG] approveTxHash:", approveTxHash ?? "No se necesitó approve");

  if (typeof core.contribute !== "function") throw new Error("core.contribute no existe en ABI");

  const tx = await core.contribute(campaignId, amountInBaseUnits);
  console.log("[DEBUG] Transacción enviada:", tx);

  const receipt = await tx.wait();
  console.log("[DEBUG] Receipt:", receipt);

  return { approveTxHash, contributeTxHash: receipt.transactionHash };
}

export function useInvest() {
  return useMutation({ mutationKey: ["invest"], mutationFn: (args: InvestArgs) => performInvest(args) });
}
