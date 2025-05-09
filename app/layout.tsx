import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kinetic Tiles',
  description: 'Interactive 3D visualization of kinetic energy tiles.',
  generator: 'Lavenda Doris',
  openGraph: {
    title: 'Kinetic Tiles',
    description: 'Explore how kinetic energy tiles work with this interactive 3D visualization.',
    url: 'https://kinetic-energy-tile.vercel.app/',
    siteName: 'Kinetic Tiles',
    images: [
      {
        url: 'https://kinetic-energy-tile.vercel.app/og-image.png', // Replace with your image URL if you have one
        width: 1200,
        height: 630,
        alt: 'Kinetic Tiles 3D Visualization',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kinetic Tiles',
    description: 'Explore how kinetic energy tiles work with this interactive 3D visualization.',
    images: ['https://kinetic-energy-tile.vercel.app/og-image.png'], // Replace with your image URL if you have one
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
