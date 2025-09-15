"use client"

import { useProjects as useWeb3Projects, useProject as useWeb3Project } from "@/lib/web3"

export function useProjects() {
  return useWeb3Projects()
}

export function useProject(projectId: string) {
  return useWeb3Project(projectId)
}
