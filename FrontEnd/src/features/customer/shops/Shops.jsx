import { Link } from "react-router-dom";
import CustomerShell from "../components/CustomerShell";
import ShopCard from "../components/ShopCard";
import { shops } from "../data/customerData";

const Shops = () => <CustomerShell><section><h1 className="text-3xl md:text-4xl font-bold text-[#14261f] mb-2">Shops</h1><p className="text-gray-500 mb-8">Discover trusted local stores near you.</p><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">{shops.map((shop) => <Link key={shop.id} to={`/customer/shops/${shop.id}`}><ShopCard shop={shop} /></Link>)}</div></section></CustomerShell>;

export default Shops;
