import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, MapPin, Star } from "lucide-react";
import { getVendorMarketplacePath } from "../../utils/marketplace";
import CardImage from "../common/CardImage";

const MarketplaceShopCard = ({ shop }) => {
  return (
    <motion.article whileHover={{ y: -6 }} className="h-full">
      <Link to={getVendorMarketplacePath(shop)} className="card-surface card-shine group flex h-full flex-col overflow-hidden">
        <div className="card-media relative h-44 overflow-hidden sm:h-52">
          <CardImage src={shop.image} alt={shop.name} category={shop.category} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-(--color-primary-dark)/80 via-(--color-primary-dark)/20 to-transparent p-3 pt-10">
            <h3 className="line-clamp-1 text-sm font-bold text-white">{shop.name}</h3>
          </div>
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-(--color-primary-dark)">
            {shop.category}
          </span>
          <span className="absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-(--color-primary) px-2 py-0.5 text-[10px] font-bold text-white">
            <Star className="h-3 w-3 fill-current" />
            {shop.rating}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <div className="flex items-center justify-between text-[11px] text-(--color-text-muted)">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-(--color-primary)" />
              {shop.deliveryTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-(--color-primary)" />
              {shop.location}
            </span>
          </div>
          <span className="mt-auto text-xs font-semibold text-(--color-primary)">Visit shop →</span>
        </div>
      </Link>
    </motion.article>
  );
};

export default MarketplaceShopCard;
