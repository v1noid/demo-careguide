import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const noteSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
  },
  { timestamps: true },
);

noteSchema.index({ owner: 1, _id: -1 });

export type NoteAttrs = InferSchemaType<typeof noteSchema>;
export type INote = HydratedDocument<NoteAttrs>;

export const Note = model("Note", noteSchema);
