import { Router } from "express";
import { z } from "zod";
import { In } from "typeorm";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { requireRole } from "../../common/middleware/roles.js";
import { validate } from "../../common/middleware/validate.js";
import { getPagination, pagedResponse } from "../../common/utils/pagination.js";
import { AppDataSource, repo } from "../../config/db.js";

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
    const applicantIds = [...new Set(items.map((item) => item.applicantId))];
    const [applicants, deliveryPartners] = applicantIds.length
      ? await Promise.all([
          repo("User").find({
            where: { id: In(applicantIds) },
            select: { id: true, name: true, email: true, phone: true },
          }),
          repo("DeliveryPartner").find({ where: { userId: In(applicantIds) } }),
        ])
      : [[], []];
    const applicantsById = new Map(applicants.map((applicant) => [applicant.id, applicant]));
    const partnersByUserId = new Map(deliveryPartners.map((partner) => [partner.userId, partner]));
    const enrichedItems = items.map((approval) => {
      const applicant = applicantsById.get(approval.applicantId);
      const partner = partnersByUserId.get(approval.applicantId);
      const contact = partner?.contactData || {};
      const identity = partner?.identityData || {};
      return {
        ...approval,
        applicantName: contact.fullName || identity.fullName || applicant?.name || "",
        email: contact.email || applicant?.email || "",
        phone: contact.phone || applicant?.phone || "",
        vehicleType: partner?.vehicleType || contact.vehicleType || "",
        vehicleNumber: partner?.vehicleNumber || contact.vehicleNumber || "",
        contactData: contact,
        identityData: identity,
        addressData: partner?.addressData || {},
      };
    });
    res.json(pagedResponse(enrichedItems, total, page, limit));
  })
);

/** GET /api/approvals/:id/documents — the applicant's real uploaded documents. */
router.get(
  "/:id/documents",
  asyncHandler(async (req, res) => {
    const approvals = repo("Approval");
    const approval = await approvals.findOne({ where: { id: req.params.id } });
    if (!approval) return res.status(404).json({ ok: false, error: "Approval not found." });

    if (approval.type === "shopkeeper") {
      const shop = await repo("Shop").findOne({ where: { ownerId: approval.applicantId } });
      if (!shop) return res.json({ ok: true, data: [] });
      const items = await repo("ShopDocument").find({
        where: { shopId: shop.id },
        order: { createdAt: "ASC" },
      });
      return res.json({ ok: true, data: items });
    }

    const partner = await repo("DeliveryPartner").findOne({
      where: { userId: approval.applicantId },
    });
    if (!partner) return res.json({ ok: true, data: [] });
    const items = await repo("DeliveryDocument").find({
      where: { partnerId: partner.id },
      order: { createdAt: "ASC" },
    });
    res.json({ ok: true, data: items });
  })
);

/** PATCH /api/approvals/:id — approve/reject, cascades to shop/partner. */
router.patch(
  "/:id",
  validate({ body: z.object({ status: z.enum(["approved", "rejected"]), notes: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    const saved = await AppDataSource.transaction(async (manager) => {
      const approvals = manager.getRepository("Approval");
      const approval = await approvals.findOne({ where: { id: req.params.id } });
      if (!approval) throw Object.assign(new Error("Approval not found."), { status: 404 });
      if (!["pending", "rejected"].includes(approval.status)) {
        throw Object.assign(new Error("Approved applications cannot be reviewed again."), { status: 409 });
      }

      if (approval.type === "shopkeeper") {
        const shops = manager.getRepository("Shop");
        const shop = await shops.findOne({ where: { ownerId: approval.applicantId } });
        if (!shop) throw Object.assign(new Error("Applicant shop not found."), { status: 404 });
        shop.isApproved = req.body.status === "approved";
        await shops.save(shop);
      } else {
        const partners = manager.getRepository("DeliveryPartner");
        const partner = await partners.findOne({ where: { userId: approval.applicantId } });
        if (!partner) throw Object.assign(new Error("Delivery partner profile not found."), { status: 404 });
        partner.isApproved = req.body.status === "approved";
        partner.applicationStatus = req.body.status;
        if (req.body.status !== "approved") partner.isOnline = false;
        await partners.save(partner);
      }

      approval.status = req.body.status;
      approval.notes = req.body.notes?.trim() || null;
      approval.reviewedBy = req.user.id;
      approval.reviewedAt = new Date();
      return approvals.save(approval);
    });
    res.json({ ok: true, data: saved });
  })
);

export default router;
