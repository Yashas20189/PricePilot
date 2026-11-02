import { CalendarDays, Sparkles } from "lucide-react";
export default function WelcomeSection({user}) {
 const date=new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"});
 const first=user?.name?.trim()?.split(" ")[0]||user?.email?.split("@")[0]||"there";
 return <section className="pp-welcome"><div><div className="pp-eyebrow"><Sparkles size={12}/> YOUR PRICE WORKSPACE</div><h1>Good to see you, {first}.</h1><p>Here’s what’s happening with the products you’re tracking.</p></div><div className="pp-date"><CalendarDays size={14}/>{date}</div></section>;
}