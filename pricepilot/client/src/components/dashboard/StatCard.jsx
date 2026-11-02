export default function StatCard({title,value,subtitle,icon:Icon,tone="violet"}) {
 return <article className="pp-stat-card"><div className="pp-stat-top"><span>{title}</span><i className={`pp-stat-icon ${tone}`}><Icon size={16}/></i></div><strong>{value}</strong><small>{subtitle}</small></article>;
}