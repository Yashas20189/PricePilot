import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({
  user,
  searchTerm,
  setSearchTerm,
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">

        {/* Navbar */}
        <Navbar
          user={user}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-12 py-10">
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;