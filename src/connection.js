import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();
const mongoURI = `${process.env.DB_HOST}/mobilecards`;

const connectToMongo = async () => {
  try {
    await mongoose
      .connect(mongoURI)
      .then(() => console.log("Connected to Database"))
      .catch((err) => console.log(err));
  } catch (error) {
    console.log("An Error Occured : " + error);
  }
};

// export const centrulConnection = mongoose.createConnection(
//   `${process.env.DB_HOST}/centruldb`
// );

export const centrulConnection = await mongoose
  .createConnection(`${process.env.DB_HOST}`)
  .asPromise();

export default connectToMongo;
