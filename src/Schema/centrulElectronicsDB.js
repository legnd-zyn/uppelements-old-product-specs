import mongoose from "mongoose";
import { centrulConnection } from "../connection.js";

const schema = mongoose.Schema({
  title: {
    type: String,
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

const centrulElectronicsModel = centrulConnection.model(
  "electronics",
  schema,
  "electronics"
);

export default centrulElectronicsModel;
