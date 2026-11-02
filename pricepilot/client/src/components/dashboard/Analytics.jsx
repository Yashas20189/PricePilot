import { TrendingDown, TrendingUp, Minus, Sparkles } from "lucide-react";
export default function Analytics({product,analytics}) {
 const data=analytics?.[product.id]; if(!data) return <div className="pp-analytics-empty">Add price history points to unlock buying insights.</div>;
 const current=Number(product.currentPrice||0), target=Number(product.targetPrice||0);
 const belowAverage=current<=Number(data.averagePrice);
 const targetReached=current>0&&current<=target;
 const recommendation=targetReached?"BUY NOW":belowAverage?"GOOD TIME TO WATCH":"WAIT";
 const delta=data.highestPrice?((data.highestPrice-data.lowestPrice)/data.highestPrice)*100:0;
 return <div className="pp-analytics-panel"><div className="pp-panel-heading"><div><span className="pp-eyebrow"><Sparkles size={11}/> PRICE INTELLIGENCE</span><h3>Buying insights</h3></div><span className={`pp-recommendation ${targetReached?"buy":belowAverage?"watch":"wait"}`}>{recommendation}</span></div>
 <div className="pp-insight-grid"><div><small>Lowest recorded</small><b>₹{Number(data.lowestPrice).toLocaleString("en-IN")}</b></div><div><small>Highest recorded</small><b>₹{Number(data.highestPrice).toLocaleString("en-IN")}</b></div><div><small>Historical average</small><b>₹{Number(data.averagePrice).toLocaleString("en-IN",{maximumFractionDigits:0})}</b></div></div>
 <p className="pp-insight-note">{targetReached?"The current price has reached your target. Consider checking the seller and offer terms before buying.":belowAverage?"The current price is below its recorded average, but it has not reached your target yet.":"The current price is not yet attractive compared with its recorded average."}</p></div>;
}