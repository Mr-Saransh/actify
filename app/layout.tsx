import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google"; // Corrected imports
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ACTIFY",
  description: "High-Performance Protocol Enforcement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            themes={["dark", "light-focus", "minimal", "beautiful"]}
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
