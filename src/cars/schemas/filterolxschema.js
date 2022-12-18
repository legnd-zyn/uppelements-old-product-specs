import mongoose from "mongoose";
import { centrulConnection } from "../../connection.js";

const schema = mongoose.Schema({
  title: {
    type: String,
  },
  price: {
    type: Number,
  },
  brand: {
    type: String,
  },
  slug: {
    type: String,
    index: true,
  },
  icon: {
    type: String,
  },
  detailedSpecs: {
    type: Array,
  },
  id: {
    type: Number,
  },
  mileage: {
    type: String,
  },
  location: {
    type: String,
  },
  description: {
    type: Array,
  },
  features: {
    type: Array,
  },
  images: {
    type: Array,
  },
});

const filterOlxCars = centrulConnection.model("cars", schema, "cars");

export default filterOlxCars;
