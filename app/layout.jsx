import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { UserRoleProvider } from "@/components/user-role-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "BrainBase - Organize Knowledge, Empower Minds",
  description: "A modern knowledge base management application",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black min-h-screen`}>
        <ThemeProvider>
          <UserRoleProvider>{children}</UserRoleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
