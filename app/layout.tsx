import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { ModalProvider } from "@/providers/modal-provider";
import prismadb from "@/lib/prismadb";
import { ToasterProvider } from "@/providers/toast-provider";
import { ThemeProvider } from "@/providers/theme-provider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({subsets:['latin']})
export const metadata: Metadata = {
  title: "Admin Dashbord",
  description: "Admin Dashbord",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <ClerkProvider>
    <html lang="en">
      <body
        className={inter.className}>
          <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          >
          <ToasterProvider/>
          <ModalProvider/>
          {children}
          </ThemeProvider>
      </body>
    </html>

    </ClerkProvider>
  )
}
