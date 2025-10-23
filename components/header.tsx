"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/web3";
import { walletConnect, inAppWallet } from "thirdweb/wallets";
import { sepolia } from "@/lib/chains";
import { cn } from "@/lib/utils";


export function Header() {
  const pathname = usePathname();

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Proyectos", href: "/marketplace" },
    { name: "Panel Admin", href: "/admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 m-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                BF
              </span>
            </div>
            <span className="font-bold text-xl">BrickForge</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6 m-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mr-4">
          <ConnectButton
            client={client}
            wallets={[
              inAppWallet({
                auth: { options: ["email", "google", "discord", "telegram"] },
              }),
              walletConnect(),
            ]}
            chains={[sepolia]}
            theme="light"
            connectButton={{ label: "Conectar Wallet" }}
            detailsButton={{
              displayBalanceToken: {
                11155111: "0xe6a583AAcdDA1AD92F88C7fC564B6E594bf8c6F5",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
