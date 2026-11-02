import { useEffect,useMemo,useState } from "react";
import axios from "axios";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import WelcomeSection from "../components/dashboard/WelcomeSection";
import StatsSection from "../components/dashboard/StatsSection";
import AddProductForm from "../components/dashboard/AddProductForm";
import ProductList from "../components/dashboard/ProductList";
import DashboardLayout from "../components/layout/DashboardLayout";
import TelegramConnection from "../components/dashboard/TelegramConnection";

const API_URL=import.meta.env.VITE_API_URL;
export default function Dashboard(){
 const [user,setUser]=useState(null),[products,setProducts]=useState([]),[history,setHistory]=useState({}),[analytics,setAnalytics]=useState({});
 const [searchTerm,setSearchTerm]=useState(""),[filter,setFilter]=useState("all"),[sort,setSort]=useState("recent");
 const [formOpen,setFormOpen]=useState(false),[name,setName]=useState(""),[url,setUrl]=useState(""),[targetPrice,setTargetPrice]=useState(""),[currentPrice,setCurrentPrice]=useState(""),[submitting,setSubmitting]=useState(false);
 const token=localStorage.getItem("token"),headers={Authorization:token};
 useEffect(()=>{if(!token){window.location.replace("/login");return;} (async()=>{try{const [u,p]=await Promise.all([axios.get(`${API_URL}/profile`,{headers}),axios.get(`${API_URL}/products`,{headers})]);setUser(u.data.user);setProducts(p.data);}catch(e){console.error("Dashboard load failed",e.response?.data||e.message);}})();},[]);
 const filtered=useMemo(()=>products.filter(p=>{
  const platform=p.url?.toLowerCase().includes("amazon")?"amazon":p.url?.toLowerCase().includes("flipkart")?"flipkart":"";
  const current=Number(p.currentPrice),target=Number(p.targetPrice);
  const q=searchTerm.toLowerCase();
  const matchText=p.name?.toLowerCase().includes(q)||platform.includes(q);
  const matchFilter=filter==="all"||(filter==="amazon"&&platform==="amazon")||(filter==="flipkart"&&platform==="flipkart")||(filter==="reached"&&p.currentPrice!=null&&current<=target)||(filter==="above"&&p.currentPrice!=null&&current>target);
  return matchText&&matchFilter;
 }).sort((a,b)=>sort==="price-low"?Number(a.currentPrice||0)-Number(b.currentPrice||0):sort==="price-high"?Number(b.currentPrice||0)-Number(a.currentPrice||0):sort==="name"?a.name.localeCompare(b.name):new Date(b.createdAt||0)-new Date(a.createdAt||0)),[products,searchTerm,filter,sort]);
 async function addProduct(){setSubmitting(true);try{const r=await axios.post(`${API_URL}/products`,{name,url,targetPrice:Number(targetPrice),currentPrice:currentPrice===""?undefined:Number(currentPrice)},{headers});setProducts(p=>[...p,r.data.product]);setName("");setUrl("");setTargetPrice("");setCurrentPrice("");setFormOpen(false);}catch(e){alert(e.response?.data?.message||"Could not add product.");}finally{setSubmitting(false);}}
 async function updatePrice(id){const raw=prompt("Enter the latest product price");if(raw===null||raw.trim()==="")return;const price=Number(raw);if(!Number.isFinite(price)||price<0){alert("Enter a valid price.");return;}try{await axios.put(`${API_URL}/products/${id}/price`,{price},{headers});setProducts(p=>p.map(x=>x.id===id?{...x,currentPrice:price}:x));}catch(e){alert(e.response?.data?.message||"Price update failed.");}}
 async function deleteProduct(id){try{await axios.delete(`${API_URL}/products/${id}`,{headers});setProducts(p=>p.filter(x=>x.id!==id));}catch(e){alert(e.response?.data?.message||"Could not delete product.");}}
 async function fetchHistory(id){try{const r=await axios.get(`${API_URL}/products/${id}/history`,{headers});const rows=r.data;setHistory(h=>({...h,[id]:rows}));if(!rows.length){setAnalytics(a=>({...a,[id]:null}));return;}const prices=rows.map(x=>Number(x.price)).filter(Number.isFinite);setAnalytics(a=>({...a,[id]:{lowestPrice:Math.min(...prices),highestPrice:Math.max(...prices),averagePrice:prices.reduce((s,n)=>s+n,0)/prices.length}}));}catch(e){console.error("Price history failed",e.response?.data||e.message);}}
 const filters=[["all","All products"],["amazon","Amazon"],["flipkart","Flipkart"],["reached","Target reached"],["above","Above target"]];
 return <DashboardLayout user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
  <WelcomeSection user={user}/>
  <StatsSection products={products}/>
  <TelegramConnection connected={Boolean(user?.telegramConnected)} onConnectedChange={(value)=>setUser(u=>({...u,telegramConnected:value}))}/>
  <section className="pp-management"><div className="pp-section-heading"><div><span className="pp-eyebrow">PRODUCT MANAGEMENT</span><h2>Track your products</h2><p>One watchlist for smarter buying decisions.</p></div><button className="pp-primary-button" onClick={()=>setFormOpen(true)}><Plus size={16}/> Add product</button></div>
   <div className="pp-toolbar"><div className="pp-filter-pills">{filters.map(([id,label])=><button key={id} className={filter===id?"selected":""} onClick={()=>setFilter(id)}>{label}{id==="all"&&<span>{products.length}</span>}</button>)}</div><label className="pp-inline-search"><Search size={15}/><input placeholder="Find a product..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/></label><label className="pp-sort"><SlidersHorizontal size={14}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">Recently added</option><option value="name">Name</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
  </section>
  <ProductList products={filtered} history={history} analytics={analytics} fetchHistory={fetchHistory} handleUpdatePrice={updatePrice} handleDeleteProduct={deleteProduct}/>
  <AddProductForm isOpen={formOpen} onClose={()=>setFormOpen(false)} name={name} setName={setName} url={url} setUrl={setUrl} targetPrice={targetPrice} setTargetPrice={setTargetPrice} currentPrice={currentPrice} setCurrentPrice={setCurrentPrice} handleAddProduct={addProduct} isSubmitting={submitting}/>
 </DashboardLayout>;
}
