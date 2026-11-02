import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Search, UserRound } from "lucide-react";
export default function Navbar({user,searchTerm,setSearchTerm}) {
  const [open,setOpen]=useState(false); const navigate=useNavigate();
  const name=user?.name||user?.email?.split("@")[0]||"Account";
  const initials=name.split(/[\s._-]+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();
  function logout(){localStorage.removeItem("token");navigate("/login",{replace:true});}
  return <header className="pp-topbar">
    <div className="pp-search"><Search size={16}/><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search your watchlist..."/><kbd>⌘ K</kbd></div>
    <div className="pp-topbar-actions"><button className="pp-icon-button" title="Notifications are not enabled yet"><Bell size={17}/></button><span className="pp-top-divider"/><div className="pp-profile-wrap"><button className="pp-profile" onClick={()=>setOpen(v=>!v)}><span className="pp-avatar">{initials||"U"}</span><span className="pp-profile-copy"><b>{name}</b><small>Personal workspace</small></span><ChevronDown size={14}/></button>{open&&<div className="pp-profile-menu"><div className="pp-menu-user"><b>{name}</b><small>{user?.email}</small></div><button onClick={logout}><LogOut size={14}/> Sign out</button></div>}</div></div>
  </header>;
}