import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { repo } from "../../config/db.js";
import { slugify } from "../../common/utils/helpers.js";

const router = Router();

const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().max(120).optional(),
  icon: z.string().max(100).optional(),
  imageUrl: z.string().max(500).optional(),
});

/** GET /api/categories — public. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await repo("Category").find({ order: { name: "ASC" } });
    res.json({ ok: true, data: items });
  })
);

/** GET /api/categories/:idOrSlug — public. */
router.get(
  "/:idOrSlug",
  asyncHandler(async (req, res) => {
    const categories = repo("Category");
    const { idOrSlug } = req.params;
    const item =
      (await categories.findOne({ where: { slug: idOrSlug } })) ||
      (await categories.findOne({ where: { id: idOrSlug } }).catch(() => null));
    if (!item) return res.status(404).json({ ok: false, error: "Category not found." });
    res.json({ ok: true, data: item });
  })
);

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate({ body: categorySchema }),
  asyncHandler(async (req, res) => {
    const categories = repo("Category");
    const slug = req.body.slug || slugify(req.body.name);
    const item = await categories.save(categories.create({ ...req.body, slug }));
    res.status(201).json({ ok: true, data: item });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate({ body: categorySchema.partial() }),
  asyncHandler(async (req, res) => {
    const categories = repo("Category");
    const item = await categories.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ ok: false, error: "Category not found." });
    Object.assign(item, req.body);
    res.json({ ok: true, data: await categories.save(item) });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    await repo("Category").delete({ id: req.params.id });
    res.json({ ok: true });
  })
);

export default router;
