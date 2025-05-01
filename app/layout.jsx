import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "BraineBase",
  description: "Your knowledge management platform",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0e0a1a] text-white min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            <div className="fixed inset-0 bg-gradient-to-br from-[#1a1333]/30 via-transparent to-[#7b4fff]/10 pointer-events-none" />
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
