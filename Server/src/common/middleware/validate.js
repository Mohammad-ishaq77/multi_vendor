/** Zod validation middleware: validate({ body, query, params }) with zod schemas. */
export function validate(schemas) {
  return (req, res, next) => {
    try {
      for (const key of ["body", "query", "params"]) {
        if (schemas[key]) {
          req[key] = schemas[key].parse(req[key]);
        }
      }
      return next();
    } catch (err) {
      const issues = err?.issues?.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json({ ok: false, error: "Validation failed.", issues });
    }
  };
}
