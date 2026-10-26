import { z } from "zod";

export const idSchema = z.uuid();

const contentSchema = z.record(z.string(), z.unknown());

export const createNoteSchema = z.object({
  title: z.string().max(300).default("Untitled Note"),
  content: contentSchema.default({}),
  plainText: z.string().max(500_000).default(""),
});

export const updateNoteSchema = z
  .object({
    title: z.string().max(300),
    content: contentSchema,
    plainText: z.string().max(500_000),
  })
  .partial();

export const searchSchema = z.string().trim().max(200).default("");
