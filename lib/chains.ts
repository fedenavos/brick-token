import { sepolia as sepoliaChain } from "thirdweb/chains"

// Re-export chains for easier importing
// export const polygon = polygonChain
// export const polygonAmoy = polygonAmoyChain
export const sepolia = sepoliaChain

// Chain configuration
export const SUPPORTED_CHAINS = [ sepolia]

// Get target chain based on environment
export function getTargetChain() {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
  if (chainId === "11155111") return sepolia
  return sepolia // default to sepolia
}
