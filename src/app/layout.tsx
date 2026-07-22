import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/src/components/ui/sonner";
import { GoogleAnalytics } from "@/src/components/common/GoogleAnalytics";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smkmuh2cibiru.sch.id"),
  title: {
    default: "SMK Muhammadiyah 2 Cibiru | SMK Unggulan Bandung",
    template: "%s | SMK Muhammadiyah 2 Cibiru",
  },
  description:
    "SMK Muhammadiyah 2 Cibiru adalah sekolah menengah kejuruan unggulan di Bandung dengan 5 program keahlian: PPLG, TJKT, Otomotif, MPLB, dan AKL. Mendidik generasi terampil dan berakhlak mulia.",
  keywords: [
    "SMK Muhammadiyah 2 Cibiru",
    "SMK Bandung",
    "sekolah kejuruan Bandung",
    "PPLG",
    "TJKT",
    "Teknik Otomotif",
    "MPLB",
    "AKL",
    "SMK Muhammadiyah Bandung",
    "sekolah SMK Cibiru",
  ],
  authors: [{ name: "SMK Muhammadiyah 2 Cibiru" }],
  openGraph: {
    title: "SMK Muhammadiyah 2 Cibiru | SMK Unggulan Bandung",
    description:
      "Sekolah menengah kejuruan unggulan di Bandung dengan 5 program keahlian: PPLG, TJKT, Otomotif, MPLB, dan AKL. Mendidik generasi terampil dan berakhlak mulia.",
    url: "https://smkmuh2cibiru.sch.id",
    siteName: "SMK Muhammadiyah 2 Cibiru",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "https://www.smkmuh2cibiru.sch.id/_next/image?url=https%3A%2F%2Faynuunaurwugqbuhwxbx.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fpublic-assets%2Fgallery%2F1769565002816.jpeg&w=1920&q=75",
        width: 1200,
        height: 630,
        alt: "SMK Muhammadiyah 2 Cibiru",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SMK Muhammadiyah 2 Cibiru | SMK Unggulan Bandung",
    description:
      "Sekolah menengah kejuruan unggulan di Bandung dengan 5 program keahlian: PPLG, TJKT, Otomotif, MPLB, dan AKL.",
    images: [
      "https://www.smkmuh2cibiru.sch.id/_next/image?url=https%3A%2F%2Faynuunaurwugqbuhwxbx.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fpublic-assets%2Fgallery%2F1769565002816.jpeg&w=1920&q=75",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "SMK Muhammadiyah 2 Cibiru",
  url: "https://smkmuh2cibiru.sch.id",
  logo: "https://smkmuh2cibiru.sch.id/apple-touch-icon.png",
  description:
    "Sekolah menengah kejuruan unggulan di Bandung dengan 5 program keahlian: PPLG, TJKT, Otomotif, MPLB, dan AKL.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Cilengkrang II No. 7",
    addressLocality: "Bandung",
    addressRegion: "Jawa Barat",
    postalCode: "40615",
    addressCountry: "ID",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+62-821-2009-1616",
    contactType: "admissions",
    availableLanguage: "Indonesian",
  },
  sameAs: [
    "https://instagram.com/smkmuh2.cibiru",
    "https://facebook.com/smkmuh2cibiru",
    "https://youtube.com/@smkmudacibiru",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="id">
      <body className={`${inter.variable} antialiased font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
