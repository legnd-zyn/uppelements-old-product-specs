import express from "express";

const router = express.Router();
import connect, { centrulConnection } from "../src/connection.js";

connect();

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const filter = async (req, res, next) => {
  const collections = (await centrulConnection.db.listCollections().toArray())
    .map((collection) => collection.name)
    .filter((collection) => !collection.includes("commoninfo"));

  const FinalArr = [];

  for (const collection of collections) {
    const db = centrulConnection.db.collection(`${collection}commoninfo`);

    const obj = {
      title: `${collection.charAt(0).toUpperCase()}${collection.slice(1)}`,
      linkTo: `/${collection}`,
      type: collection,
      dropdown: [
        ...(await db.find().toArray())[0].brands.map((data) => {
          return {
            title: capitalize(data),
            type: collection,
          };
        }),
      ],
    };

    FinalArr.push(obj);
  }

  // console.log(FinalArr);

  // const mobiles = {
  //   title: "Mobiles",
  //   linkTo: "/mobiles",
  //   type: "mobiles",
  //   dropdown: [
  //     ...mobileBrandsArr[0].brands.map((data) => {
  //       return {
  //         title: capitalize(data),
  //         type: "mobiles",
  //       };
  //     }),
  //   ],
  // };
  // const electronics = {
  //   title: "Electronics",
  //   linkTo: "/electronics",
  //   type: "electronics",
  //   dropdown: [
  //     ...electronicsBrandsArr[0].brands.map((data) => {
  //       return {
  //         title: capitalize(data),
  //         type: "electronics",
  //       };
  //     }),
  //   ],
  // };

  // const obj = [mobiles, electronics];
  req.body.data = FinalArr;

  next();
};

router.get("/", filter, (req, res) => {
  res.send(req.body.data);
});

export default router;
