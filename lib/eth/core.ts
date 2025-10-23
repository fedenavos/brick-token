// "use client";

// import { BrowserProvider, Contract, parseUnits } from "ethers";
// import bs58 from "bs58";
// import CoreAbi from "@/contracts/global/Core.json"; // tu ABI

// // Convierte CIDv0 (base58) a bytes32
// export function ipfsCidToBytes32(cid: string): string {
//   const raw = cid.startsWith("ipfs://") ? cid.slice(7) : cid;
//   const decoded = bs58.decode(raw);
//   if (decoded.length !== 34) throw new Error("CID inválido (debe ser CIDv0, 34 bytes).");
//   return "0x" + Buffer.from(decoded.slice(2)).toString("hex");
// }

// // Retorna instancia del contrato Core
// export async function getCoreContract(address: string) {
//   if (typeof window === "undefined" || !window.ethereum) {
//     throw new Error("Metamask no está disponible");
//   }

//   const provider = new BrowserProvider(window.ethereum);
//   await provider.send("eth_requestAccounts", []);
//   const signer = await provider.getSigner();
//   return new Contract(address, CoreAbi, signer);
// }

// // Convierte un monto a unidades del token (BigInt)
// export function toTokenUnits(amount: string | number, decimals = 6) {
//   return parseUnits(String(amount), decimals);
// }
