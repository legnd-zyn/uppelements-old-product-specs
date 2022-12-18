import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import connection, { centrulConnection } from "./src/connection.js";

connection();

var uri =
  "mongodb://zain:zainking@ac-gdtyz6s-shard-00-00.2qyxhmm.mongodb.net:27017,ac-gdtyz6s-shard-00-01.2qyxhmm.mongodb.net:27017,ac-gdtyz6s-shard-00-02.2qyxhmm.mongodb.net:27017/?ssl=true&replicaSet=atlas-62m5h6-shard-0&authSource=admin&retryWrites=true&w=majority";

// const conn = await MongoClient.connect(uri);

console.log(
  (
    await centrulConnection.db
      .collection("mobilescommoninfo")
      .find()
      .limit(5)
      .toArray()
  )[0].brands
);
