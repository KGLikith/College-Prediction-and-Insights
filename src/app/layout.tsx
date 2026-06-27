import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/provider/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KCET Admission Insights",
  description:
    "Predict your KCET college admission chances by rank and category, explore cutoffs and trends, and build your option-entry preference list.",
  applicationName: "KCET Admission Insights",
  keywords: [
    "KCET",
    "KCET college predictor",
    "KCET cutoff",
    "Karnataka CET",
    "college prediction",
    "KEA counselling",
  ],
  openGraph: {
    title: "KCET Admission Insights",
    description:
      "Predict your KCET college admission chances by rank and category, explore cutoffs and trends, and build your option-entry preference list.",
    siteName: "KCET Admission Insights",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "KCET Admission Insights",
    description:
      "Predict your KCET college admission chances by rank and category, explore cutoffs and trends.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
        suppressHydrationWarning

      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
