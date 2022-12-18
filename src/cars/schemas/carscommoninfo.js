import mongoose from "mongoose";
import { centrulConnection } from "../../connection.js";

const carsCommonInfoModel = centrulConnection.model(
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
  }),
  "carscommoninfo"
);

export default carsCommonInfoModel;
