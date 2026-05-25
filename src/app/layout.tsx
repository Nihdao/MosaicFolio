import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { getConfig } from "@/lib/content";
import DevModeToggle from "@/components/editor/DevModeToggle";

function getContrastText(hex: string): string {
  const clean = hex.replace('#', '')
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return '#1A1A1A'
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const r = channel(parseInt(clean.slice(0, 2), 16))
  const g = channel(parseInt(clean.slice(2, 4), 16))
  const b = channel(parseInt(clean.slice(4, 6), 16))
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.6 ? '#1A1A1A' : '#FAFAFA'
}

function buildConfigCss(config: ReturnType<typeof getConfig>): string {
  const accentFg = getContrastText(config.accent)
  const sc = config.status_colors ?? {}
  const statusVars = Object.entries(sc)
    .filter(([, v]) => v)
    .map(([k, v]) => `--status-${k}-bg: ${v}; --status-${k}-text: ${getContrastText(v!)};`)
    .join('\n      ')

  const base = `--accent: ${config.accent}; --accent-foreground: ${accentFg}; ${statusVars}`

  return `
    :root { ${base} }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) { --accent: ${config.accent}; --accent-foreground: ${accentFg}; }
    }
    :root[data-theme="dark"] { --accent: ${config.accent}; --accent-foreground: ${accentFg}; }
  `
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  return {
    ...(config.canonical_url && {
      metadataBase: new URL(config.canonical_url),
    }),
    title: config.name,
    description: config.tagline,
    openGraph: {
      title: config.name,
      description: config.tagline,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.name,
      description: config.tagline,
      images: ["/og.png"],
    },
    ...(config.canonical_url && {
      alternates: { canonical: config.canonical_url },
    }),
  };
}

const themeScript = `(function(){var t=localStorage.getItem('theme')||'auto';if(t!=='auto')document.documentElement.setAttribute('data-theme',t)})()`

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getConfig()
  const configCss = buildConfigCss(config)
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style dangerouslySetInnerHTML={{ __html: configCss }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Suspense fallback={null}>
          <DevModeToggle />
        </Suspense>
      </body>
    </html>
  );
}
