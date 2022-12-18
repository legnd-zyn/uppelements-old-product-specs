import mongoose from "mongoose";
import { centrulConnection } from "../connection.js";
import dotenv from "dotenv";
dotenv.config();
const MobileCardSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
  },
  brand: {
    type: String,
  },
  slug: {
    type: String,
  },
  icon: {
    type: String,
  },
  detailedSpecs: {
    type: Array,
  },
});

// centrulConnection.db("test").collection("cars").ins;

const CentrulMobileDB = mongoose.model(
  "CentrulMobileDB",
  MobileCardSchema,
  "mobiles"
);
// CentrulMobileDB.createIndexes();
export default CentrulMobileDB;
