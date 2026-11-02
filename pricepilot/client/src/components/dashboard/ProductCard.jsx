import { useState } from "react";
import { Package, ExternalLink, ChevronDown, ChevronUp, Pencil, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import Analytics from "./Analytics";
import PriceChart from "./PriceChart";
import PriceHistory from "./PriceHistory";
export default function ProductCard({product,analytics,history,isExpanded,toggleDetails,handleUpdatePrice,handleDeleteProduct}) {
 const [confirmDelete,setConfirmDelete]=useState(false);
 const platform=product.url?.toLowerCase().includes("amazon")?"Amazon":product.url?.toLowerCase().includes("flipkart")?"Flipkart":"Store";
 const current=Number(product.currentPrice||0), target=Number(product.targetPrice||0), reached=current>0&&target>0&&current<=target;
 const diff=Math.abs(current-target);
 return <article className="pp-product-card"><div className="pp-product-main"><div className="pp-product-thumb"><Package size={25}/><small>PRODUCT</small></div><div className="pp-product-info"><div className="pp-product-meta"><span className={`pp-platform ${platform.toLowerCase()}`}>{platform}</span><span className={`pp-status ${reached?"reached":"waiting"}`}>{reached?"Target reached":"Above target"}</span></div><h3>{product.name}</h3><a href={product.url} target="_blank" rel="noreferrer">View store <ExternalLink size={11}/></a></div><div className="pp-product-actions"><button onClick={()=>handleUpdatePrice(product.id)} title="Update price"><Pencil size={15}/></button><button className="danger" onClick={()=>setConfirmDelete(true)} title="Delete product"><Trash2 size={15}/></button></div></div>
 <div className="pp-price-row"><div><small>CURRENT PRICE</small><b className={reached?"positive":""}>{product.currentPrice==null?"Not checked":`₹${current.toLocaleString("en-IN")}`}</b></div><div><small>YOUR TARGET</small><b className="target">{target?`₹${target.toLocaleString("en-IN")}`:"Not set"}</b></div></div>
 <div className="pp-product-footer"><span className={reached?"positive":"warning"}>{reached?<TrendingDown size={14}/>:<TrendingUp size={14}/>} {product.currentPrice==null?"Waiting for first price check":reached?"Target reached":`₹${diff.toLocaleString("en-IN")} above your target`}</span><button onClick={()=>toggleDetails(product.id)}>{isExpanded?"Hide insights":"Price insights"} {isExpanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</button></div>
 {isExpanded&&<div className="pp-product-expanded"><PriceChart history={history?.[product.id]||[]} targetPrice={product.targetPrice}/><div className="pp-expanded-bottom"><Analytics product={product} analytics={analytics}/><PriceHistory history={history?.[product.id]||[]}/></div></div>}
 {confirmDelete&&<div className="pp-confirm-backdrop"><div className="pp-confirm"><h3>Remove this product?</h3><p>This will remove {product.name} from your watchlist.</p><div><button onClick={()=>setConfirmDelete(false)}>Cancel</button><button className="danger" onClick={()=>handleDeleteProduct(product.id)}>Remove product</button></div></div></div>}
 </article>;
}