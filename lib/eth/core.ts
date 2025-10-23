// lib/eth/core.ts
"use client"

import { BrowserProvider, Contract, parseUnits } from "ethers"
import bs58 from "bs58"
// Importa el ABI de Core, ajustando si tu JSON tiene "abi" dentro
import CoreAbiJson from "../../contracts/abis/Core.json"

const CoreAbi = CoreAbiJson.abi || CoreAbiJson // asegura que siempre tengas el array de ABI

/**
 * Convierte un CIDv0 (Base58) de IPFS en un hash bytes32 compatible con Solidity
 */
export function ipfsCidToBytes32(cid: string): string {
  const raw = cid.startsWith("ipfs://") ? cid.slice(7) : cid
  const decoded = bs58.decode(raw)
  if (decoded.length !== 34) throw new Error("CID inválido (debe ser CIDv0, 34 bytes)")
  return "0x" + Buffer.from(decoded.slice(2)).toString("hex")
}

/**
 * Inicializa el contrato Core conectado al signer (cuenta activa en MetaMask)
 */
export async function getCoreContract(address: string) {
  if (typeof window === "undefined") throw new Error("No se puede acceder a window en SSR")
  const { ethereum } = window as any
  if (!ethereum) throw new Error("No se detectó MetaMask")

  // Ethers v6 BrowserProvider
  const provider = new BrowserProvider(ethereum)
  const signer = await provider.getSigner()

  // Contract con ABI correctamente cargado
  return new Contract(address, CoreAbi, signer)
}

/**
 * Convierte un número decimal en unidades del token (por defecto 6 decimales, ej. USDC)
 */
export function toTokenUnits(amount: string | number, decimals = 6) {
  return parseUnits(String(amount), decimals)
}
