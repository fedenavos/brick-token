"use client"

import { useActiveAccount, useActiveWallet } from "thirdweb/react"
import { useUserRole, useNetworkValidation } from "../web3"
import { useEffect, useRef } from "react"

export function useWeb3Integration() {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const address = account?.address
  const { data: userRole, refetch: refetchRole } = useUserRole(address)
  const { isCorrectNetwork, targetChainId, getNetworkName } = useNetworkValidation()

  const registeredAddresses = useRef<Set<string>>(new Set())

  const isConnected = !!account && !!wallet
  const currentChainId = wallet?.getChain()?.id
  const isCorrectNet = isCorrectNetwork(currentChainId)

  useEffect(() => {
    const registerUser = async () => {
      if (!address || registeredAddresses.current.has(address)) {
        return
      }

      try {
        console.log("[v0] New wallet connected, registering user:", address)

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        })

        if (!response.ok) {
          throw new Error("Failed to register user")
        }

        const data = await response.json()

        if (data.isNewUser) {
          console.log("[v0] New user registered successfully:", address)
        } else {
          console.log("[v0] Existing user connected:", address)
        }

        // Mark this address as registered in this session
        registeredAddresses.current.add(address)

        // Refetch user role to get the updated data
        refetchRole()
      } catch (error) {
        console.error("[v0] Error registering user:", error)
      }
    }

    if (isConnected && address) {
      registerUser()
    }
  }, [isConnected, address, refetchRole])

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

    userRole,
    isAdmin: userRole === "admin",
    isManager: userRole === "manager",
    isUser: userRole === "user",

    // user: can invest
    // manager: can approve milestones, submit evidence, but NOT manage projects or KYC
    // admin: full access to everything
    canInvest: isConnected && isCorrectNet && (userRole === "user" || userRole === "manager" || userRole === "admin"),
    canApproveMilestones: isConnected && isCorrectNet && (userRole === "manager" || userRole === "admin"),
    canSubmitEvidence: isConnected && isCorrectNet && (userRole === "manager" || userRole === "admin"),
    canManageProjects: isConnected && isCorrectNet && userRole === "admin",
    canManageKYC: isConnected && isCorrectNet && userRole === "admin",
  }
}
