import mongoose from "mongoose";
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

// const centrulConnection = mongoose.createConnection(
//   `${process.env.DB_HOST}/centruldb`
// );

const CentrulMobileDB = mongoose.model("CentrulMobileDB", MobileCardSchema);
CentrulMobileDB.createIndexes();
export default CentrulMobileDB;
