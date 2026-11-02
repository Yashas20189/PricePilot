export default function PriceHistory({history=[]}) {
 if(!history?.length) return null;
 return <div className="pp-history-panel"><div className="pp-panel-heading"><div><span className="pp-eyebrow">RECENT CHECKS</span><h3>Price log</h3></div></div><div className="pp-history-list">{[...history].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6).map(item=><div key={item.id}><b>₹{Number(item.price).toLocaleString("en-IN")}</b><time>{new Date(item.createdAt).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</time></div>)}</div></div>;
}