import { NavLink } from "react-router-dom";
import { Activity, LayoutDashboard, Package, ChartNoAxesCombined, Bell, Settings, ChevronLeft, Gem } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const items = [
  {to:"/dashboard",label:"Overview",icon:LayoutDashboard},
  {to:"/dashboard#products",label:"Products",icon:Package},
  {to:"/dashboard#analytics",label:"Price analytics",icon:ChartNoAxesCombined},
  {to:"/dashboard#alerts",label:"Alerts",icon:Bell},
];
export default function Sidebar() {
  const [collapsed,setCollapsed]=useState(false);
  return <aside className={`pp-sidebar ${collapsed?"is-collapsed":""}`}>
    <div className="pp-sidebar-brand"><span className="pp-brand-mark"><Activity size={18}/></span>{!collapsed&&<span><b>PricePilot</b><small>Price intelligence</small></span>}<button className="pp-collapse" onClick={()=>setCollapsed(v=>!v)} title="Collapse sidebar"><ChevronLeft size={15}/></button></div>
    <div className="pp-nav-label">{!collapsed&&"WORKSPACE"}</div>
    <nav className="pp-side-nav">{items.map(({to,label,icon:Icon})=><a key={to} href={to} title={collapsed?label:undefined} className={`pp-side-link ${to==="/dashboard"?"active":""}`}><Icon size={17}/>{!collapsed&&<span>{label}</span>}</a>)}</nav>
    <div className="pp-sidebar-bottom">
      {!collapsed&&<div className="pp-plan-card"><div className="pp-plan-icon"><Gem size={16}/></div><b>PricePilot Plus</b><p>More tracking. Better decisions.</p><span>Explore plans ↗</span></div>}
      <div className="pp-sidebar-tools"><ThemeToggle/><span>{!collapsed&&"Appearance"}</span></div>
      <small className="pp-copyright">{!collapsed&&"© 2026 PricePilot"}</small>
    </div>
  </aside>;
}