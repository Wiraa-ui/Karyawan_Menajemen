import "./globals.css";
import AuthLayout from "@/components/AuthLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#1a202c] text-white">
        <AuthLayout>{children}</AuthLayout>
      </body>
    </html>
  );
}
