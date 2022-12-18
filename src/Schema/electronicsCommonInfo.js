import mongoose from "mongoose";
import { centrulConnection } from "../connection.js";

const electronicsCommonInfoModel = centrulConnection.model(
  "electronicscommoninfo",
  mongoose.Schema({
    title: {
      type: String,
      default: "commoninfo",
      unique: true,
    },
    brands: {
      type: Array,
    },
  }),
  "electronicscommoninfo"
);

export default electronicsCommonInfoModel;
