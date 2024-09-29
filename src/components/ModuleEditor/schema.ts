import { z } from "zod";
import { moduleAlreadyInStorage } from "../Home/helpers";

const moduleIdRegex = /[^a-zA-Z0-9-ß_~.\u0080-\uFFFF]/g;

const hasNoSpaces = (value: string) => !value.match(/ /g);

const isValid = (value: string) => !moduleIdRegex.test(value);

export const isNotDuplicate = (value: string) => !moduleAlreadyInStorage(value);

const langIsValid = (value: string) => value === "en" || value === "de";

export type IModuleSchema = z.infer<typeof moduleEditorSchema>;

export const moduleEditorSchema = z.object({
  /* ID */
  id: z
    .string()
    .trim()
    .min(1, { message: "Provide an ID for the module." })
    .refine((value) => !value.includes("module"), {
      message: `The word "module" is a reserved keyword and can't be used inside an ID!`,
    })
    .refine(hasNoSpaces, (value) => ({
      message: `The ID has to be one word! Use hyphens ("-") to concat the word (${value.replace(/ /g, "-")})`,
    }))
    .refine(isValid, (value) => ({
      message: `The id contains invalid characters (${value.match(moduleIdRegex)?.join(", ")})`,
    })),

  /* Name */
  name: z.string().trim().min(1, { message: "Provide a name for the module." }),

  /* Language */
  lang: z
    .string()
    .min(1, { message: "Select a language for the module." })
    .refine(langIsValid, { message: "Language is invalid. Please report this issue at contact@repeatio.de" }),

  /* Compatibility */
  compatibility: z.string().min(1, {
    message:
      "Invalid compatibility version. Please contact the devs through GitHub (https://github.com/Rllyyy/repeatio).",
  }),

  /* Type */
  type: z.string().min(1), // this should be z.literal("module")

  /* Questions */
  questions: z.array(z.unknown()).default([]),
});
