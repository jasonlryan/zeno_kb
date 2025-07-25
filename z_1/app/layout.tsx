import "../styles/globals.css";
// import PasswordProtection from "../components/PasswordProtection";
import AuthGuard from "../components/AuthGuard";

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
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
