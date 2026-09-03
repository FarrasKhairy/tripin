import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "TRIPIN - Plan your trip. Enjoy the journey.",
  description:
    "Temukan destinasi, susun itinerary, dan kelola budget perjalananmu bersama TRIPIN.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}