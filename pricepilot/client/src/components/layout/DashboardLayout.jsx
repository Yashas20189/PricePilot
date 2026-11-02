import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
export default function DashboardLayout({user,searchTerm,setSearchTerm,children}) {
 return <div className="pp-app-shell"><Sidebar/><div className="pp-main-shell"><Navbar user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm}/><main className="pp-main-content"><div className="pp-content-inner">{children}</div></main></div></div>;
}