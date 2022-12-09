import mongoose from "mongoose";
import { centrulConnection } from "../connection.js";

const mobilesCommonInfoModel = mongoose.model(
  "mobilesCommonInfo",
  mongoose.Schema({
    title: {
      type: String,
      default: "commoninfo",
      unique: true,
    },
    brands: {
      type: Array,
    },
  })
);

export default mobilesCommonInfoModel;
