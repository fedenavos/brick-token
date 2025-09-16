import { polygon as polygonChain, polygonAmoy as polygonAmoyChain } from "thirdweb/chains"

// Re-export chains for easier importing
export const polygon = polygonChain
export const polygonAmoy = polygonAmoyChain

// Chain configuration
export const SUPPORTED_CHAINS = [polygon, polygonAmoy]

// Get target chain based on environment
export function getTargetChain() {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
  if (chainId === "137") return polygon
  if (chainId === "80002") return polygonAmoy
  return polygon // default to mainnet
}
