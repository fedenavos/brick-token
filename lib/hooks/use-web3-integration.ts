"use client"

import { useActiveAccount, useActiveWallet } from "thirdweb/react"
import { useUserRole, useNetworkValidation } from "../web3"

export function useWeb3Integration() {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const address = account?.address
  const { data: userRole } = useUserRole(address)
  const { isCorrectNetwork, targetChainId, getNetworkName } = useNetworkValidation()

  const isConnected = !!account && !!wallet
  const currentChainId = wallet?.getChain()?.id
  const isCorrectNet = isCorrectNetwork(currentChainId)

  return {
    // Connection state
    address,
    isConnected,
    wallet,
    account,

    // Network validation
    isCorrectNetwork: isCorrectNet,
    targetChainId,
    currentChainId,
    networkName: currentChainId ? getNetworkName(currentChainId) : undefined,
    targetNetworkName: getNetworkName(targetChainId),

    // User role
    userRole,
    isAdmin: userRole === "admin",
    isEmissor: userRole === "emisor",
    isDesarrollador: userRole === "desarrollador",
    isAuditor: userRole === "auditor",
    isInvestor: userRole === "investor",

    // Utility functions
    canInvest: isConnected && isCorrectNet && (userRole === "investor" || userRole === "admin"),
    canApprove:
      isConnected && isCorrectNet && (userRole === "auditor" || userRole === "emisor" || userRole === "admin"),
    canSubmitEvidence: isConnected && isCorrectNet && (userRole === "desarrollador" || userRole === "admin"),
    canManageProjects: isConnected && isCorrectNet && (userRole === "emisor" || userRole === "admin"),
  }
}
