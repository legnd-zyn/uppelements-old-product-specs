import mongoose from "mongoose";

export const MobileCardSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  salePrice: {
    type: String,
  },
  retailPrice: {
    type: String,
  },
  dataBrand: {
    type: String,
  },
  dataSlug: {
    type: String,
  },
  image: {
    type: String,
  },
  id: {
    type: Number,
    unique: true,
  },
  detailedSpecs: {
    type: Object,
  },
});

const MobileCard = mongoose.model("MobileCard", MobileCardSchema);
// MobileCard.createIndexes();

export default MobileCard;
