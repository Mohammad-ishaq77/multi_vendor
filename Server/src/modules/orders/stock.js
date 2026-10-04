import { repo } from "../../config/db.js";

/**
 * Order creation decrements product stock, so every terminal cancellation has to
 * give it back. Transition guards make a double release impossible.
 */
export async function releaseOrderStock(orderId) {
  const items = await repo("OrderItem").find({ where: { orderId } });
  if (!items.length) return 0;
  const products = repo("Product");
  let released = 0;
  for (const item of items) {
    const product = await products.findOne({ where: { id: item.productId } });
    if (!product) continue;
    product.stock = Number(product.stock || 0) + Number(item.quantity || 0);
    await products.save(product);
    released += Number(item.quantity || 0);
  }
  return released;
}