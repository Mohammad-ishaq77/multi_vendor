import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { repo } from "../../config/db.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

/** GET /api/approvals?type=shopkeeper|delivery_partner */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {};
    if (req.query.type === "shopkeeper") where.type = "shopkeeper";
    if (req.query.type === "delivery" || req.query.type === "delivery_partner") where.type = "delivery_partner";
    if (req.query.status) where.status = req.query.status;
    const [items, total] = await repo("Approval").findAndCount({
      where,
      order: { appliedAt: "DESC" },
      skip,
      take,
    });
    res.json(pagedResponse(items, total, page, limit));
  })
);

/** PATCH /api/approvals/:id — approve/reject, cascades to shop/partner. */
router.patch(
  "/:id",
  validate({ body: z.object({ status: z.enum(["approved", "rejected"]), notes: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    const approvals = repo("Approval");
    const approval = await approvals.findOne({ where: { id: req.params.id } });
    if (!approval) return res.status(404).json({ ok: false, error: "Approval not found." });
    approval.status = req.body.status;
    approval.notes = req.body.notes;
    approval.reviewedBy = req.user.id;
    approval.reviewedAt = new Date();
    const saved = await approvals.save(approval);

    try {
      if (approval.type === "shopkeeper") {
        const shops = repo("Shop");
        const shop = await shops.findOne({ where: { ownerId: approval.applicantId } });
        if (shop) {
          shop.isApproved = req.body.status === "approved";
          await shops.save(shop);
        }
      } else {
        const partners = repo("DeliveryPartner");
        const partner = await partners.findOne({ where: { userId: approval.applicantId } });
        if (partner) {
          partner.isApproved = req.body.status === "approved";
          partner.applicationStatus = req.body.status;
          await partners.save(partner);
        }
      }
    } catch { /* cascade best-effort */ }

    res.json({ ok: true, data: saved });
  })
);

export default router;
