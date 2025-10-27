declare global {
  interface Window {
    ethereum?: any;
  }
}

import { BrowserProvider, Contract, parseUnits } from "ethers";
import { useMutation } from "@tanstack/react-query";

import CoreABI from "../contracts/abis/Core.json";
import ERC20ABI from "../contracts/abis/ERC20.json";

export type InvestArgs = {
  projectId: string | number;
  campaignId: string | number | bigint;
  amount: string;
  addresses: {
    core: `0x${string}`;
    usdt: `0x${string}`;
  };
};

export type InvestResult = {
  approveTxHash?: string;
  contributeTxHash: string;
  aporteId?: number;
};

async function getProviderAndSigner() {
  if (!window.ethereum) {
    throw new Error("No Ethereum provider found");
  }
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  return { provider, signer, account };
}

async function approveIfNeeded(
  tokenContract: Contract,
  owner: string,
  spender: string,
  amount: bigint
): Promise<string | undefined> {
  const allowance: bigint = await tokenContract.allowance(owner, spender);
  if (allowance >= amount) {
    return undefined;
  }

  const tx = await tokenContract.approve(spender, amount);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

async function performInvest({
  projectId,
  campaignId,
  amount,
  addresses,
}: InvestArgs): Promise<InvestResult> {
  const { signer, account } = await getProviderAndSigner();

  const core = new Contract(addresses.core, CoreABI.abi ?? CoreABI, signer);
  const usdt = new Contract(addresses.usdt, ERC20ABI.abi ?? ERC20ABI, signer);

  const decimals = Number(await usdt.decimals());
  const amountInBaseUnits = parseUnits(amount, decimals);

  const approveTxHash = await approveIfNeeded(
    usdt,
    account,
    addresses.core,
    amountInBaseUnits
  );

  if (!core.contribute) {
    throw new Error(
      "El método 'contribute' no existe en el contrato Core. Revisá el ABI importado."
    );
  }

  const tx = await core.contribute(campaignId, amountInBaseUnits);
  const receipt = await tx.wait();

  const contributeTxHash = receipt?.hash ?? receipt?.transactionHash;

  let aporteId: number | undefined = undefined;

  try {
    const res = await fetch("/api/investments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        investorAddress: account,
        projectId: projectId,
        amount: amount,
        txHash: contributeTxHash,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      aporteId = data.id;
    } else {
      console.error(
        "DB insert failed while recording aporte:",
        await res.text()
      );
    }
  } catch (err) {
    console.error("Request to /api/aportes failed:", err);
  }

  return {
    approveTxHash,
    contributeTxHash,
    aporteId,
  };
}

export function useInvest() {
  return useMutation({
    mutationKey: ["invest"],
    mutationFn: (args: InvestArgs) => performInvest(args),
  });
}
