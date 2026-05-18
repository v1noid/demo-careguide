import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const postSchema = new Schema(
  {
    author: {
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

postSchema.index({ author: 1, _id: -1 });

export type PostAttrs = InferSchemaType<typeof postSchema>;
export type IPost = HydratedDocument<PostAttrs>;

export const Post = model("Post", postSchema);
