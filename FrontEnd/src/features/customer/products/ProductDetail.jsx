import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Minus, Package, Plus, ShoppingCart, Star, Store } from "lucide-react";
import { productService, reviewService } from "../../../services/catalogService";
import { normalizeProduct, normalizeReviews } from "../../../utils/normalize";
import { useAsyncData } from "../../../hooks/useAsyncData";
import CustomerShell from "../components/CustomerShell";
import CardImage from "../../../components/common/CardImage";
import ProductRecommendations from "../../../components/products/ProductRecommendations";
import { useCart } from "../context/CartContext";
import { useAuth } from "../../../hooks/useAuth";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]").includes(id);
    } catch {
      return false;
    }
  });
  const [cartError, setCartError] = useState("");
  const [adding, setAdding] = useState(false);
  const state = useAsyncData(
    () => productService.get(id).then(normalizeProduct),
    [id],
    { enabled: Boolean(id) }
  );
  const product = state.data;
  const reviewsState = useAsyncData(
    () => reviewService.list({ productId: id, limit: 100 }).then((result) => normalizeReviews(result.items)),
    [id],
    { enabled: Boolean(id) }
  );
  const reviews = reviewsState.data || [];
  const hasReviewed = reviews.some((review) => review.reviewerId === user?.id);

  const toggleWishlist = () => {
    let ids = [];
    try {
      ids = JSON.parse(localStorage.getItem("nearmart_wishlist") || "[]");
    } catch {
      ids = [];
    }
    const next = saved ? ids.filter((productId) => productId !== id) : [...ids, id];
    localStorage.setItem("nearmart_wishlist", JSON.stringify(next));
    window.dispatchEvent(new Event("nearmart-wishlist-change"));
    setSaved(!saved);
  };

  const handleAddToCart = async (goToCart = false) => {
    setAdding(true);
    setCartError("");
    const result = await addToCart(product, quantity);
    setAdding(false);
    if (!result.ok) {
      setCartError(result.error);
      return;
    }
    if (goToCart) navigate("/customer/cart");
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!product?.shopId || reviewRating < 1) return;

    setReviewSaving(true);
    setReviewError("");
    setReviewSubmitted(false);
    try {
      await reviewService.create({
        shopId: product.shopId,
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewSubmitted(true);
      setReviewRating(0);
      setReviewComment("");
      await Promise.all([state.reload(), reviewsState.reload()]);
      navigate(`/customer/product/${product.id}#reviews`, { replace: true });
    } catch (error) {
      setReviewError(error.message || "Your review could not be submitted. Please try again.");
    } finally {
      setReviewSaving(false);
    }
  };

  return (
    <CustomerShell>
      <section className="mx-auto w-full max-w-6xl">
        <Link to="/customer/products" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>

        {state.loading ? (
          <p className="py-16 text-center text-sm text-gray-500">Loading product...</p>
        ) : state.error ? (
          <div role="alert" className="py-16 text-center text-sm text-rose-700">
            <p>Product could not be loaded. {state.error}</p>
            <button type="button" onClick={state.reload} className="mt-3 font-semibold underline">Retry</button>
          </div>
        ) : !product ? (
          <div className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">Product not found</h1>
            <p className="mt-2 text-sm text-gray-500">This product may have been removed or is no longer available.</p>
          </div>
        ) : (
          <div className="grid gap-8 rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-8 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
              <CardImage src={product.image} alt={product.name} category={product.category} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={toggleWishlist}
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute right-3 top-3 rounded-full bg-white p-3 shadow ${saved ? "text-rose-600" : "text-gray-500"}`}
              >
                <Heart className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="flex flex-col">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{product.category || "Product"}</p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
              <div className="mt-2 flex items-center gap-2" aria-label={`${product.rating} out of 5 stars`}>
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">
                  ({product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-emerald-800">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                )}
                <span className="text-sm text-gray-500">/ {product.unit || "item"}</span>
              </div>
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {product.description || "No description provided by the shop."}
              </p>
              <p className={`mt-4 text-sm font-medium ${product.stock > 0 && product.available ? "text-emerald-700" : "text-rose-600"}`}>
                {product.available && product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
              </p>

              {product.shopId && (
                <Link
                  to={`/customer/shops/${product.shopId}`}
                  className="mt-6 flex items-center gap-3 rounded-md border border-gray-100 p-4 hover:border-emerald-200"
                >
                  <Store className="h-6 w-6 text-emerald-700" />
                  <span className="min-w-0">
                    <span className="block text-xs text-gray-500">Sold by</span>
                    <span className="block truncate font-semibold text-gray-900">{product.shop || "Local shop"}</span>
                    {product.shopLocation && (
                      <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" /> {product.shopLocation}
                      </span>
                    )}
                  </span>
                  <span className="ml-auto text-sm font-semibold text-emerald-700">View shop</span>
                </Link>
              )}

              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center rounded-md border border-gray-200">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-2.5">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(Math.max(1, product.stock), value + 1))} disabled={quantity >= product.stock} className="p-2.5 disabled:opacity-40">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {cartError && <p role="alert" className="mt-3 text-sm text-rose-600">{cartError}</p>}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  disabled={adding || !product.available || product.stock < 1}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-700 px-4 py-3 text-sm font-semibold text-emerald-800 disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" /> {adding ? "Adding..." : "Add to cart"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={adding || !product.available || product.stock < 1}
                  className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Order now
                </button>
              </div>
            </div>
          </div>
        )}

        {product?.id && (
          <section id="reviews" className="mt-10 scroll-mt-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">Ratings & reviews</h2>
              <p className="mt-1 text-sm text-gray-500">Share your experience with this product.</p>
            </div>

            {hasReviewed || reviewSubmitted ? (
              <p className="mb-6 rounded-md bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                You have already reviewed this product. Thank you for your feedback.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="mb-8 rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                <label className="block text-sm font-semibold text-gray-800">Your rating</label>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      aria-label={`Rate ${star} out of 5 stars`}
                      aria-pressed={reviewRating === star}
                      className="rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                    >
                      <Star
                        className={`h-6 w-6 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
                <label htmlFor="product-review-comment" className="mt-4 block text-sm font-semibold text-gray-800">
                  Comment <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <textarea
                  id="product-review-comment"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="What did you think of this product?"
                  className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
                />
                {reviewError && <p role="alert" className="mt-2 text-sm text-rose-600">{reviewError}</p>}
                {reviewSubmitted && <p role="status" className="mt-2 text-sm text-emerald-700">Thanks for rating this product.</p>}
                <button
                  type="submit"
                  disabled={reviewSaving || reviewRating < 1}
                  className="mt-4 rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reviewSaving ? "Submitting..." : "Submit rating"}
                </button>
              </form>
            )}

            {reviewsState.loading ? (
              <p className="py-6 text-center text-sm text-gray-500">Loading reviews...</p>
            ) : reviewsState.error ? (
              <div role="alert" className="rounded-md bg-rose-50 p-4 text-sm text-rose-700">
                <p>Reviews could not be loaded. {reviewsState.error}</p>
                <button type="button" onClick={reviewsState.reload} className="mt-2 font-semibold underline">Retry</button>
              </div>
            ) : reviews.length === 0 ? (
              <p className="rounded-md border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                No reviews yet. Be the first to rate this product.
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-gray-800">{review.customer}</span>
                      <time dateTime={review.createdAt} className="text-xs text-gray-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                      </time>
                    </div>
                    <div className="mt-2 flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} aria-hidden="true" className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    {review.comment && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">{review.comment}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {product?.id && <ProductRecommendations productId={product.id} />}
      </section>
    </CustomerShell>
  );
};

export default ProductDetail;
