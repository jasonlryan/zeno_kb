import type { Metadata } from "next";
import "./globals.css";
import PasswordProtection from "../components/PasswordProtection";

export const metadata: Metadata = {
  title: "Zeno Knowledge Hub",
  description: "Private knowledge base for AI tools and resources",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="robots"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex, nocache"
        />
        <meta
          name="googlebot"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex, nocache"
        />
        <meta
          name="bingbot"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex, nocache"
        />
      </head>
      <body>
        <PasswordProtection>{children}</PasswordProtection>
      </body>
    </html>
  );
}
