import type { Metadata } from "next";
import { Cinzel, Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import AppSidebar, { AppSidebarAccount } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import TRPCProvider from "@/lib/trpc/Provider";
import { getUserProfile } from "@/lib/auth/userProfile";
import { createClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/utils";
import "./globals.css";

// Every route's shell depends on auth state (sidebar vs. none), so this
// layout can't produce a static instant-navigation shell.
export const instant = false;

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Luno Travel",
  description: "A travel journal",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${cinzel.variable} h-full`}
    >
      <body className={`${geistSans.className} h-full antialiased`}>
        <TRPCProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {user ? (
              <SidebarProvider>
                <AppSidebar footer={<AppSidebarAccount {...getUserProfile(user)} />} />
                <SidebarInset>{children}</SidebarInset>
              </SidebarProvider>
            ) : (
              children
            )}
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
