// lib/eth/core.ts
"use client";
//env"
import { BrowserProvider, Contract, parseUnits } from "ethers";
import bs58 from "bs58";
import CoreAbiJson from "../../contracts/abis/Core.json";
const CoreAbi = CoreAbiJson.abi || CoreAbiJson;

// traer de env
export const CORE_ADDRESS =
  process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS ||
  "0x8424f5bE942050Ce9cF9c0B00ED55B27e14F6874";

/**
 * Convierte un CIDv0 (Base58) de IPFS en un hash bytes32 compatible con Solidity
 */
export function ipfsCidToBytes32(cid: string): string {
  const raw = cid.startsWith("ipfs://") ? cid.slice(7) : cid;
  const decoded = bs58.decode(raw);
  if (decoded.length !== 34)
    throw new Error("CID inválido (debe ser CIDv0, 34 bytes)");
  return "0x" + Buffer.from(decoded.slice(2)).toString("hex");
}

/**
 * Inicializa el contrato Core conectado al signer (cuenta activa en MetaMask)
 */
export async function getCoreContract(address: string = CORE_ADDRESS) {
  if (typeof window === "undefined")
    throw new Error("No se puede acceder a window en SSR");
  const { ethereum } = window as any;
  if (!ethereum) throw new Error("No se detectó MetaMask");

  // Ethers v6 BrowserProvider
  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new Contract(address, CoreAbi, signer);
}

/**
 * Convierte un número decimal en unidades del token (por defecto 6 decimales, ej. USDC)
 */
export function toTokenUnits(amount: string | number, decimals = 6) {
  return parseUnits(String(amount), decimals);
}
