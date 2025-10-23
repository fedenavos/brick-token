import { BrowserProvider, Contract, parseUnits } from "ethers";
import { useMutation } from "@tanstack/react-query";

// Reemplaza estos imports con tus rutas reales de ABIs / helpers
import CoreABI from "@/contracts/abis/Core.json";
import ERC20ABI from "@/contracts/abis/ERC20.json";
import IdentityRegistryABI from "@/contracts/abis/IdentityRegistry.json";

export type InvestArgs = {
  campaignId: string | number | bigint; // == projectId en tu UI
  certificateId: string | number | bigint; // requerido por Core.contribute
  amount: string; // en unidades humanas ("1234.56")
  addresses: {
    core: `0x${string}`;
    usdt: `0x${string}`;
    identityRegistry: `0x${string}`;
  };
};

export type InvestResult = {
  approveTxHash?: string;
  contributeTxHash: string;
};

function invariant(cond: any, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function ensureProviderAndSigner() {
  invariant(
    typeof window !== "undefined" && (window as any).ethereum,
    "No se detectó un proveedor EVM; instala o abre tu wallet."
  );
  const provider = new BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  return { provider, signer, account };
}

async function checkKyc(
  identityRegistryAddr: string,
  account: string,
  provider: any
) {
  const identity = new Contract(
    identityRegistryAddr,
    IdentityRegistryABI,
    provider
  );
  const isVerified: boolean = await identity.isVerified(account);
  invariant(
    isVerified,
    "KYC no verificado on-chain (IdentityRegistry.isVerified = false)"
  );
}

async function maybeApprove(
  usdt: Contract,
  owner: string,
  spender: string,
  amount: bigint
) {
  const allowance: bigint = await usdt.allowance(owner, spender);
  if (allowance >= amount) return undefined; // ya alcanza
  const tx = await usdt.approve(spender, amount);
  const receipt = await tx.wait();
  return receipt?.hash as string | undefined;
}

async function performInvest({
  campaignId,
  certificateId,
  amount,
  addresses,
}: InvestArgs): Promise<InvestResult> {
  const { provider, signer, account } = await ensureProviderAndSigner();

  // 1) KYC (on-chain) — defensa extra además del flag de UI
  await checkKyc(addresses.identityRegistry, account, provider);

  // 2) Instancias de contratos
  const core = new Contract(addresses.core, CoreABI, signer);
  const usdt = new Contract(addresses.usdt, ERC20ABI, signer);

  // 3) Decimals
  let decimals = 6; // USDT suele ser 6; igual intentamos leerlo por si fuese mock u otro token
  try {
    decimals = Number(await usdt.decimals());
  } catch {}

  // 4) Parsear monto y aprobar si hace falta
  const amountInBaseUnits = parseUnits(amount, decimals);
  const approveTxHash = await maybeApprove(
    usdt,
    account,
    addresses.core,
    amountInBaseUnits
  );

  // 5) Contribute
  const tx = await core.contribute(
    campaignId,
    certificateId,
    amountInBaseUnits
  );
  const receipt = await tx.wait();

  return { approveTxHash, contributeTxHash: receipt?.hash as string };
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
