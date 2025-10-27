"use client"

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CORE_ADDRESS = "0x8424f5bE942050Ce9cF9c0B00ED55B27e14F6874";
const CORE_ABI = [
  "function viewCampaign(uint _campaignId) view returns (tuple(uint id,address campaignCreator,bytes32 ipfsHash,uint goal,uint startsAt,uint endsAt,uint8 status,uint totalContributions,address custody,address tokenMinter,uint CertificateID))",
];
const CUSTODY_ABI = [
  "function milestones(uint campaignId, uint index) view returns (uint256 index,uint256 amount,bool released,bytes32 ipfsHash,uint8 status_m)",
  "function checkBalance() view returns (uint256)",
  "function releaseMilestone(uint campaignId,uint milestoneIndex,address to)"
];

const FACTORY_ADDRESS = "0xYOUR_FACTORY_ADDRESS";
const FACTORY_ABI = [
  "function deployCustody(uint256 campaignId,address fiduciario,address auditor,address tokenAddress) external",
  "function deployModules(uint256 campaignId,address fiduciario,string memory tokenName,string memory tokenSymbol) external",
  "function getModules(uint256 campaignId) external view returns (tuple(address custody,address tokenMinter,address fideiToken,address generalCompliance,bool modulesDeployed))"
];

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
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState(0)

  const [wallets, setWallets] = useState<{campaignId:number,address:string,balance:number,milestones:number}[]>([
    { campaignId: 1, address: "0xFAKE_WALLET_1", balance: 250000, milestones: 1 },
  ])

  // ==== Crear campaña ====
  const [ipfs, setIpfs] = useState("")
  const [projectName, setProjectName] = useState("")
  const [goal, setGoal] = useState("")

  const [modulesInfo, setModulesInfo] = useState<any | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      if (!window.ethereum) return alert("Conecta una wallet primero");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const core = new ethers.Contract(CORE_ADDRESS, CORE_ABI, provider);

      const statusMap = [
        "PENDING",
        "APPROVED",
        "DEPLOYED",
        "COLLECTING",
        "EXECUTING",
        "DISTRIBUTING",
        "CANCELLED",
        "FAILED",
        "COMPLETED",
      ];

      const newCampaigns: any[] = [];
      let id = 1;

      while (true) {
        try {
          const c = await core.viewCampaign(id);
          if (c.id == 0) break;

          const campaign = {
            id: Number(c.id),
            name: ethers.decodeBytes32String(c.ipfsHash) || `Campaign ${id}`,
            creator: c.campaignCreator,
            custody: c.custody,
            goal: ethers.formatUnits(c.goal, 6),
            status: statusMap[c.status],
          };

          // Si tiene contrato de custody, intentar leer su balance
          if (c.custody !== ethers.ZeroAddress) {
            const custody = new ethers.Contract(c.custody, CUSTODY_ABI, provider);
            const balance = await custody.checkBalance();
            campaign.balance = ethers.formatUnits(balance, 6);
          }

          newCampaigns.push(campaign);
          id++;
        } catch {
          break;
        }
      }

      setCampaigns(newCampaigns);
    } catch (err) {
      console.error("Error cargando campañas:", err);
    }
  };

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

  const deployFideiWallet = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const fiduciario = await signer.getAddress();
      const auditor = "0x0000000000000000000000000000000000000000"; // reemplazar con dirección real
      const tokenAddress = "0x0000000000000000000000000000000000000000"; // reemplazar con token USDC real
      const tx = await factory.deployCustody(selectedCampaign, fiduciario, auditor, tokenAddress);
      await tx.wait();
      alert(`✅ Custody desplegado para campaña ${selectedCampaign}`);
      fetchModules();
    } catch (err) {
      console.error("Error desplegando Custody:", err);
      alert("❌ Error desplegando Custody");
    } finally {
      setLoading(false);
    }
  };

  const deployModules = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const fiduciario = await signer.getAddress();
      const tx = await factory.deployModules(selectedCampaign, fiduciario, "FIDEI", "FID");
      await tx.wait();
      alert(`✅ Módulos desplegados para campaña ${selectedCampaign}`);
      fetchModules();
    } catch (err) {
      console.error("Error desplegando módulos:", err);
      alert("❌ Error desplegando módulos");
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
      const mods = await factory.getModules(selectedCampaign);
      setModulesInfo(mods);
    } catch (err) {
      console.error("Error obteniendo módulos:", err);
    }
  };

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

    const releaseRealMilestone = async () => {
      try {
        if (!currentWallet?.address) return alert("No hay wallet seleccionada");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const custody = new ethers.Contract(currentWallet.address, CUSTODY_ABI, signer);
        const tx = await custody.releaseMilestone(currentWallet.campaignId, 0, await signer.getAddress());
        await tx.wait();
        alert("💰 Milestone liberado en blockchain");
      } catch (err) {
        console.error(err);
        alert("Error liberando milestone");
      }
    };

    releaseRealMilestone();
    setModalOpen(false);
  }

  return (
    <RoleGuard>
      <div className="min-h-screen bg-white text-black p-8 font-sans">
        <ConnectBar />
        <h1 className="text-3xl font-bold mb-8 text-center text-black">Bienvenido a tu perfil</h1>

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

        <div className="mt-8 p-4 bg-black text-white rounded-xl border border-gray-700">
          <h3 className="text-xl font-semibold mb-3 text-green-500">Campañas y Custody</h3>
          <ul className="space-y-3">
            {campaigns.map(c => (
              <li key={c.id} className="p-3 bg-gray-900 rounded border border-gray-600">
                <p><strong>{c.name}</strong> (ID {c.id})</p>
                <p>Estado: {c.status}</p>
                <p>Custody: {c.custody}</p>
                {c.balance && <p>💰 Balance Custody: {c.balance} USDT</p>}
              </li>
            ))}
          </ul>
        </div>

        {modulesInfo && (
          <div className="mt-6 p-4 bg-gray-900 border border-gray-600 rounded">
            <h4 className="text-lg font-semibold text-green-400 mb-2">Módulos desplegados</h4>
            <p>Custody: {modulesInfo.custody}</p>
            <p>TokenMinter: {modulesInfo.tokenMinter}</p>
            <p>FideiToken: {modulesInfo.fideiToken}</p>
            <p>GeneralCompliance: {modulesInfo.generalCompliance}</p>
            <p>ModulesDeployed: {modulesInfo.modulesDeployed ? "✅" : "❌"}</p>
          </div>
        )}

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