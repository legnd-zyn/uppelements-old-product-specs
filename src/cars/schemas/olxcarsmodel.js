import mongoose from "mongoose";

const schema = mongoose.Schema({
  title: {
    type: String,
  },
  id: {
    type: Number,
    unique: true,
  },
  price: {
    type: String,
  },
  mileage: {
    type: String,
  },
  location: {
    type: String,
  },
  details: {
    type: Array,
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

const olxCarsModel = mongoose.model("olxcars", schema);

export default olxCarsModel;
