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
  console.log(allowance, amount);
  if (allowance >= amount) {
    return undefined;
  }

  const tx = await tokenContract.approve(spender, amount);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

async function performInvest({
  campaignId,
  amount,
  addresses,
}: InvestArgs): Promise<InvestResult> {
  const { provider, signer, account } = await getProviderAndSigner();

  console.log("addresses:", addresses);

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
  console.log("approveTxHash:", approveTxHash);

  if (!core.contribute) {
    throw new Error(
      "El método 'contribute' no existe en el contrato Core. Revisá el ABI importado."
    );
  }

  const tx = await core.contribute(campaignId, amountInBaseUnits);
  console.log("tx:", tx);

  const receipt = await tx.wait();
  console.log("receipt:", receipt);

  return {
    approveTxHash,
    contributeTxHash: receipt?.transactionHash as string,
  };
}

export function useInvest() {
  return useMutation({
    mutationKey: ["invest"],
    mutationFn: (args: InvestArgs) => performInvest(args),
  });
}

// -----------------------------------------------------------------------------
// PARCHE de integración en tu InvestPanel (ejemplo mínimo)
// -----------------------------------------------------------------------------
// 1) Agregar prop certificateId y las addresses necesarias
// 2) Pasar amount en string humano (sin *1e6)
// 3) El hook se ocupa de approve + contribute + esperar confirmaciones

/*
// InvestPanel.tsx (extracto)
interface InvestPanelProps {
  projectId: string;
  certificateId: string; // <— NUEVO
  minTicket: string;
  currency: string;
  estado: string; // espera "RECAUDACION" cuando Core.STATUS == COLLECTING
  kycStatus?: string;
  addresses: { // <— NUEVO: evita hardcodear en el hook
    core: `0x${string}`;
    usdt: `0x${string}`;
    identityRegistry: `0x${string}`;
  };
}

export function InvestPanel({...}: InvestPanelProps) {
  const [amount, setAmount] = useState("");
  const investMutation = useInvest();

  const handleInvest = async () => {
    if (!canProceed) return;
    try {
      await investMutation.mutateAsync({
        campaignId: projectId,
        certificateId,
        amount, // en string humano
        addresses,
      });
      setAmount("");
    } catch (e) {
      console.error("[invest] error:", e);
    }
  };
}
*/

// -----------------------------------------------------------------------------
// Notas de UX sugeridas
// -----------------------------------------------------------------------------
// - Un solo botón que hace ambos pasos (Approve si es necesario + Contribute),
//   mostrando un sub‑estado: "Aprobando USDT…", luego "Enviando contribución…".
// - Si allowance ya alcanza, se salta el paso de approve automáticamente.
// - Opcional: tooltip con la dirección del Core y el certificado usado.
// - Importante: manejar estados de campaña; habilitar botón solo en COLLECTING.
