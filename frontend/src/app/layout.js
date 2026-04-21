import "./globals.css";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header />
        {/* The main tag takes up all available space, pushing footer down */}
        <main className="grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
