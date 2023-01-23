import joi from "joi";

export const walletSchema = joi.object({
  description: joi.string().required(),
  value: joi.number().required(),
  type: joi.string().valid("output", "entry").required(),
});
