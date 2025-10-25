"use client"

import { useState } from "react"

// ==== SIMPLE UI ====
const Card = ({ children, className }: any) => (
  <div className={`bg-black text-white border border-gray-700 rounded-xl p-6 shadow-md ${className || ""}`}>
    {children}
  </div>
)
const CardContent = ({ children }: any) => <div>{children}</div>
const CardHeader = ({ children }: any) => <div className="mb-3">{children}</div>
const CardTitle = ({ children }: any) => <h3 className="text-xl font-semibold">{children}</h3>
const Button = ({ children, onClick, disabled, className }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-5 py-2 rounded-lg font-medium border border-gray-600 hover:bg-green-700 hover:text-white transition ${disabled ? "bg-gray-700 cursor-not-allowed" : "bg-green-600"} ${className}`}
  >
    {children}
  </button>
)
const RoleGuard = ({ children }: any) => <>{children}</>
const ConnectBar = () => (
  <div className="mb-6 p-3 bg-gray-100 text-black font-medium rounded text-center border border-gray-300">
    🔌 Wallet desconectada (Simulado)
  </div>
)
const Modal = ({ open, onClose, children }: any) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-black p-6 rounded-xl w-96 text-white border border-gray-600">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-white" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  )
}

// ==== MOCK DATA ====
const MOCK_CAMPAIGNS = [
  { id: 1, name: "Proyecto Palermo" },
  { id: 2, name: "Proyecto Recoleta" },
]

export default function TokenizationDashboardMock() {
  const [loading, setLoading] = useState(false)
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS)
  const [selectedCampaign, setSelectedCampaign] = useState(MOCK_CAMPAIGNS[0].id)

  const [wallets, setWallets] = useState<{campaignId:number,address:string,balance:number,milestones:number}[]>([
    { campaignId: 1, address: "0xFAKE_WALLET_1", balance: 250000, milestones: 1 },
  ])

  // ==== Crear campaña ====
  const [ipfs, setIpfs] = useState("")
  const [projectName, setProjectName] = useState("")
  const [goal, setGoal] = useState("")

  const createProject = () => {
    if(!ipfs || !projectName || !goal){
      alert("Completa todos los campos")
      return
    }
    setLoading(true)
    setTimeout(()=>{
      const newId = campaigns.length + 1
      const newCampaign = { id: newId, name: projectName }
      setCampaigns([...campaigns,newCampaign])
      alert(`✅ Proyecto "${projectName}" creado! Estado: PENDING. ID: MOCK${newId}`)
      setIpfs(""); setProjectName(""); setGoal("")
      setLoading(false)
    },800)
  }

  // ==== Desplegar FideiWallet y módulos ====
  const deployFideiWallet = () => {
    setLoading(true)
    setTimeout(()=>{
      const newWallet = {
        campaignId: selectedCampaign,
        address: `0xMOCK_WALLET_${selectedCampaign}`,
        balance: Math.floor(Math.random()*500000)+50000,
        milestones: 0
      }
      setWallets([...wallets.filter(w=>w.campaignId!==selectedCampaign), newWallet])
      alert(`✅ FideiWallet creada para campaña ${selectedCampaign} (Simulado)`)
      setLoading(false)
    },800)
  }

  const deployModules = () => {
    setLoading(true)
    setTimeout(()=>{
      alert(`✅ Módulos desplegados para la campaña ${selectedCampaign} (Simulado)`)
      setLoading(false)
    },800)
  }

  // ==== Modal Milestone ====
  const [modalOpen, setModalOpen] = useState(false)
  const [currentWallet, setCurrentWallet] = useState<any>(null)
  const [milestoneAmount, setMilestoneAmount] = useState("")
  const [milestoneIpfs, setMilestoneIpfs] = useState("")

  const openMilestoneModal = (wallet:any) => {
    setCurrentWallet(wallet)
    setMilestoneAmount("")
    setMilestoneIpfs("")
    setModalOpen(true)
  }

  const submitMilestone = () => {
    if(!milestoneAmount || !milestoneIpfs){
      alert("Completa todos los campos del milestone")
      return
    }
    const amountNum = parseInt(milestoneAmount)
    if(amountNum > currentWallet.balance){
      alert("No hay suficiente saldo")
      return
    }

    setWallets(wallets.map(w=>{
      if(w.campaignId===currentWallet.campaignId){
        return {...w, balance: w.balance - amountNum, milestones: w.milestones+1}
      }
      return w
    }))
    alert(`💰 Milestone agregado para la campaña ${currentWallet.campaignId}!\nAmount: ${amountNum}\nIPFS: ${milestoneIpfs}`)
    setModalOpen(false)
  }

  return (
    <RoleGuard>
      <div className="min-h-screen bg-white text-black p-8 font-sans">
        <ConnectBar />
        <h1 className="text-3xl font-bold mb-8 text-center text-black">Dashboard Tokenización (Simulado)</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Crear proyecto */}
          <Card>
            <CardHeader>
              <CardTitle>Crear Nueva Campaña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input 
                placeholder="IPFS Hash" 
                value={ipfs} 
                onChange={e=>setIpfs(e.target.value)} 
                className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input 
                placeholder="Nombre del Proyecto" 
                value={projectName} 
                onChange={e=>setProjectName(e.target.value)} 
                className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input 
                placeholder="Objetivo (USDC)" 
                value={goal} 
                onChange={e=>setGoal(e.target.value)} 
                className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button onClick={createProject} disabled={loading} className="w-full mt-2">{loading ? "Creando..." : "Crear Campaña"}</Button>
            </CardContent>
          </Card>

          {/* Desplegar FideiWallet / Módulos */}
          <Card>
            <CardHeader>
              <CardTitle>FideiWallet y Módulos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 font-medium">Selecciona campaña existente:</p>
              <select 
                value={selectedCampaign} 
                onChange={e=>setSelectedCampaign(parseInt(e.target.value))} 
                className="w-full px-3 py-2 mb-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {campaigns.map(c=><option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>)}
              </select>
              <Button onClick={deployFideiWallet} disabled={loading} className="w-full mb-2">{loading ? "Procesando..." : "Crear FideiWallet"}</Button>
              <Button onClick={deployModules} disabled={loading} className="w-full">{loading ? "Procesando..." : "Desplegar Módulos"}</Button>
            </CardContent>
          </Card>
        </div>

        {/* Wallets y Milestones */}
        <div className="mt-8 p-4 bg-black text-white rounded-xl border border-gray-700">
          <h3 className="text-xl font-semibold mb-3 text-green-500">FideiWallets Simuladas</h3>
          <ul className="space-y-2">
            {wallets.map(w=>(
              <li key={w.campaignId} className="p-3 bg-gray-900 rounded flex justify-between items-center border border-gray-600">
                <div>
                  <p>Campaña {w.campaignId}: <code>{w.address}</code></p>
                  <p>Saldo: ${w.balance.toLocaleString()} USDC | Milestones retirados: {w.milestones}</p>
                </div>
                <Button onClick={()=>openMilestoneModal(w)} disabled={loading || w.balance<5000} className="bg-green-600 hover:bg-green-700">Retirar Milestone</Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal Milestone */}
        <Modal open={modalOpen} onClose={()=>setModalOpen(false)}>
          <h3 className="text-xl font-bold mb-3 text-green-500">Retirar Milestone</h3>
          <p className="mb-2">Campaña: {currentWallet?.campaignId}</p>
          <input 
            type="number" 
            placeholder="Amount" 
            value={milestoneAmount} 
            onChange={e=>setMilestoneAmount(e.target.value)} 
            className="w-full px-3 py-2 mb-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input 
            type="text" 
            placeholder="IPFS Hash" 
            value={milestoneIpfs} 
            onChange={e=>setMilestoneIpfs(e.target.value)} 
            className="w-full px-3 py-2 mb-3 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Button onClick={submitMilestone} className="w-full bg-green-600 hover:bg-green-700">Confirmar Retiro</Button>
        </Modal>
      </div>
    </RoleGuard>
  )
}