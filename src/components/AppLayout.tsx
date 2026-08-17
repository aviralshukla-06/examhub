import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-56">
        <Navbar />
        <main className="pt-14 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
