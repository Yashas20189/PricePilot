import { PackageSearch } from "lucide-react";
import ProductCard from "./ProductCard";
import { useState } from "react";
export default function ProductList({products=[],history,analytics,fetchHistory,handleUpdatePrice,handleDeleteProduct}) {
 const [expanded,setExpanded]=useState(null);
 async function toggle(id){if(expanded===id){setExpanded(null);return;}await fetchHistory(id);setExpanded(id);}
 return <section id="products" className="pp-watchlist"><div className="pp-section-heading"><div><span className="pp-eyebrow">YOUR COLLECTION</span><h2>Your watchlist <span>{products.length}</span></h2><p>Keep tabs on the prices that matter to you.</p></div><span className="pp-count">{products.length} {products.length===1?"product":"products"}</span></div>
 {products.length===0?<div className="pp-empty"><PackageSearch size={27}/><h3>Your watchlist is empty</h3><p>Add a product to start tracking its price history and target.</p></div>:<div className="pp-product-grid">{products.map(p=><ProductCard key={p.id} product={p} analytics={analytics} history={history} isExpanded={expanded===p.id} toggleDetails={toggle} handleUpdatePrice={handleUpdatePrice} handleDeleteProduct={handleDeleteProduct}/>)}</div>}</section>;
}