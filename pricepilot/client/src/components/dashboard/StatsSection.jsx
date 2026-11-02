import { Package, Target, TrendingUp, BellRing } from "lucide-react";
import StatCard from "./StatCard";
export default function StatsSection({products=[]}) {
 const valid=products.filter(p=>p.currentPrice!=null&&p.targetPrice!=null);
 const reached=valid.filter(p=>Number(p.currentPrice)<=Number(p.targetPrice)).length;
 const above=valid.length-reached;
 const stats=[
  {title:"Products tracked",value:products.length,subtitle:"In your watchlist",icon:Package,tone:"violet"},
  {title:"Target reached",value:reached,subtitle:"At or below your target",icon:Target,tone:"green"},
  {title:"Above target",value:above,subtitle:"Waiting for a price drop",icon:TrendingUp,tone:"orange"},
  {title:"Price targets",value:products.filter(p=>p.targetPrice!=null).length,subtitle:"Products with a target",icon:BellRing,tone:"blue"}
 ];
 return <section className="pp-stats-grid">{stats.map(s=><StatCard key={s.title} {...s}/>)}</section>;
}