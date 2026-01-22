import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CompSSA DSA Hub",
  description:
    "Data Structures & Algorithms learning platform by CompSSA - Practice problems, join contests, track progress, and level up your coding skills.",
  keywords: [
    "DSA",
    "Data Structures",
    "Algorithms",
    "Competitive Programming",
    "CompSSA",
    "Coding Practice",
    "LeetCode",
    "Codeforces",
  ],
  authors: [{ name: "CompSSA" }],
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  metadataBase: new URL("https://compssa-grind-hub.vercel.app/"),
  openGraph: {
    type: "website",
    title: "CompSSA DSA Hub",
    description:
      "Data Structures & Algorithms learning platform - Practice problems, join contests, and track your progress.",
    siteName: "CompSSA DSA Hub",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "CompSSA DSA Hub Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "CompSSA DSA Hub",
    description:
      "Data Structures & Algorithms learning platform - Practice problems, join contests, and track your progress.",
    images: ["/favicon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
