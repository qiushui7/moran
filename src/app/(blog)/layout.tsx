import Header from "@/components/header";

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen max-w-3xl mx-auto px-4">
      <Header />
      <main className="flex-1 py-6">{children}</main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} 保留所有权利.
      </footer>
    </div>
  );
} 