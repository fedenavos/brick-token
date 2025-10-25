// frontWEB/brick-token/contracts/global.ts
import CoreABI from "./abis/Core.json";
import ERC20ABI from "./abis/ERC20.json";
import IdentityRegistryABI from "./abis/IdentityRegistry.json";
import FiduciaryManagerABI from "./abis/FiduciaryManager.json";
import CertificateRegistryABI from "./abis/CertificateRegistry.json";

export const CONTRACTS = {
  core: {
    address: "0xE3b14a733634682fb06b81B3a5a16E8DEF629534",
    abi: CoreABI,
  },
  identityRegistry: {
    address: "0x440390040ac0732A8357Ad292Fcd6E0970f70D73",
    abi: IdentityRegistryABI,
  },
  fiduciaryManager: {
    address: "0x246FE96d2Afac597efB4f1942f745e51bbE3781F",
    abi: FiduciaryManagerABI,
  },
  certificateRegistry: {
    address: "0x652A2F1C08De941bE9CcC081FF5Ea6b20C65CF9d",
    abi: CertificateRegistryABI,
  },
  factory: {
    address: "0x1107B19B7678F8bE820d3Ef4450De3f6F58d105f",
  },
};