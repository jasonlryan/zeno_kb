import "./globals.css";
import PasswordProtection from "../components/PasswordProtection";
// import AuthGuard from "../components/AuthGuard";

export const metadata = {
  title: "Zeno Knowledge Hub",
  description: "Private knowledge base for AI tools and resources",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* PasswordProtection temporarily commented out to allow Supabase Auth to handle auth */}
        {/* <PasswordProtection> */}
        {/* <AuthGuard>{children}</AuthGuard> */}
        {children}
        {/* </PasswordProtection> */}
      </body>
    </html>
  );
}
