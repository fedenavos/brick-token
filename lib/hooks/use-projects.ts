"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProjects() {
  const { data, error, isLoading } = useSWR("/api/projects", fetcher)

  return {
    data: data || [],
    error,
    isLoading,
  }
}

export function useProject(projectId: string) {
  const { data, error, isLoading } = useSWR(projectId ? `/api/projects/${projectId}` : null, fetcher)

  return {
    data,
    error,
    isLoading,
  }
}

export function useProjectStats() {
  const { data: projects } = useProjects()

  if (!projects || projects.length === 0) {
    return {
      totalProjects: 0,
      totalTokenized: 0,
      activeInvestors: 0,
      averageROI: 0,
    }
  }

  const totalProjects = projects.length
  const totalTokenized = projects.reduce((sum: number, p: any) => sum + Number.parseFloat(p.raised || "0"), 0)
  const activeInvestors = projects.reduce((sum: number, p: any) => sum + (p.investors || 0), 0)
  const averageROI =
    projects.reduce((sum: number, p: any) => {
      const roi = p.descripcion?.rentabilidad_esperada || "0%"
      return sum + Number.parseFloat(roi.replace("%", ""))
    }, 0) / totalProjects

  return {
    totalProjects,
    totalTokenized,
    activeInvestors,
    averageROI,
  }
}
