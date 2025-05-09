"use client"
import dynamic from "next/dynamic"
import { Loader } from "@/components/loader"

// Dynamically import the 3D scene to avoid SSR issues
const EnergyTile = dynamic(() => import("@/components/energy-tile"), {
  ssr: false,
  loading: () => <Loader />,
})

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full h-screen">
        <EnergyTile />
      </div>
    </main>
  )
}
