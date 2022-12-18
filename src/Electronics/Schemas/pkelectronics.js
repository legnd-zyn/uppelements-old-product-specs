import mongoose from "mongoose";
import connectToMongo from "../../connection.js";

connectToMongo();

const schema = mongoose.Schema({
  title: {
    type: String,
    unique: true,
  },
  price: {
    type: String,
  },
  brand: {
    type: String,
  },
  slug: {
    type: String,
  },
  categories: {
    type: Array,
  },
  shortDesc: {
    type: Array,
  },
  img: {
    type: String,
  },
});

const pkElectronicsModel = mongoose.model("pkElectronics", schema);

export default pkElectronicsModel;
