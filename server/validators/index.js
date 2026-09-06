import { body, query, validationResult } from "express-validator";
import { validDate, localNow } from "../../shared/schedule.js";
const dateRule = (value) =>
  validDate(value) &&
  value >= localNow().date &&
  value <= new Date(Date.now() + 366 * 86400000).toISOString().slice(0, 10);
const phone = /^\+?[0-9\s()-]{9,25}$/;
export const availabilityRules = [
  query("date").custom(dateRule),
  query("barberId").isInt({ min: 1 }),
  query("serviceId").isInt({ min: 1 }),
];
export const appointmentRules = [
  body("serviceId").isInt({ min: 1 }),
  body("barberId").isInt({ min: 1 }),
  body("date").custom(dateRule),
  body("time").matches(/^(09|1[0-9]):(00|30)$/),
  body("name").trim().isLength({ min: 2, max: 120 }),
  body("phone").trim().matches(phone),
  body("email").trim().isEmail().isLength({ max: 254 }),
  body("message").optional().isString().isLength({ max: 2000 }),
];
export const contactRules = [
  body("name").trim().isLength({ min: 2, max: 120 }),
  body("email").trim().isEmail().isLength({ max: 254 }),
  body("phone").trim().matches(phone),
  body("subject").trim().isLength({ min: 2, max: 150 }),
  body("message").trim().isLength({ min: 10, max: 5000 }),
];
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res
      .status(422)
      .json({
        success: false,
        message: "Vérifiez les informations renseignées.",
        errors: errors
          .array()
          .map((e) => ({ field: e.path, message: "Valeur invalide." })),
      });
  next();
}
