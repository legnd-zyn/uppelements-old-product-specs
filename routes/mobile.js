import express from "express";
import connection from "../src/Schema/centrulDbSchema.js";
import mobilesCommonInfoModel from "../src/Schema/mobilesCommonInfoSchema.js";

const router = express.Router();
import { centrulConnection } from "../src/connection.js";

// connect();

// MiddleWare
async function filter(req, res, next) {
  let step = 20;
  const limit = parseInt(req.query.limit);
  let range = limit < 20 ? limit : 20;

  const minprice = parseInt(req.query.minprice);
  const maxprice = parseInt(req.query.maxprice);

  const priceQuery =
    minprice && maxprice
      ? { price: { $gt: minprice, $lt: maxprice } }
      : minprice
      ? { price: { $gt: minprice } }
      : maxprice
      ? { price: { $lt: maxprice } }
      : "";

  if (req.query.page < 2) step = 20;
  if (req.query.page < 1) {
    req.query.page = 1;
  }

  const brandQuery = req.query.brand ? { brand: req.query.brand } : {};

  const finalObj = { ...brandQuery, ...priceQuery };

  const connection = centrulConnection.db.collection(req.body.slug);

  const arr = await connection
    .find(finalObj)
    .skip(step * req.query.page - 20)
    .limit(range)
    .toArray();

  const count = await connection.countDocuments(finalObj);

  const cardData = [
    ...arr.reduce((map, obj) => map.set(obj.title, obj), new Map()).values(),
  ].map(({ title, brand, slug, price }) => {
    const obj = { title, brand, slug, price };
    return obj;
  });

  const hasMoreCondition =
    range && req.query.page ? range * req.query.page : range;

  const hasMore = hasMoreCondition <= count ? true : false;

  req.body.data = { hasMore: hasMore, result: cardData };
  next();
}

const nestedData = async (req, res, next) => {
  const connection = centrulConnection.db.collection(req.body.slug);
  const nestedData = await connection.find({ slug: req.params.slug }).toArray();

  const {
    title,
    price,
    brand,
    slug,
    detailedSpecs,
    mileage,
    location,
    description,
    features,
  } = nestedData[0];

  const finalObj = { title, price, brand, slug, detailedSpecs };

  if (mileage) {
    finalObj.mileage = mileage;
  }
  if (location) {
    finalObj.location = location;
  }
  if (description) {
    finalObj.description = description;
  }
  if (features) {
    finalObj.features = features;
  }

  req.body.data = finalObj;
  next();
};

async function getLwImg(req, res, next) {
  const connection = centrulConnection.db.collection(req.body.slug);
  if (req.params.slug) {
    const imgStr = await connection.find({ slug: req.params.slug }).toArray();

    req.body.img = imgStr[0].icon;
  }

  next();
}

router.get("/", filter, async function (req, res) {
  res.status(200).send(req.body.data);
});

router.get("/lwimg/:slug", getLwImg, async function (req, res) {
  if (req.body.img) {
    const buffer = Buffer.from(req.body.img, "base64");
    res.contentType("image/png");
    res.status(200).send(Buffer.from(buffer, "binary"));
  } else {
    res.status(404).send("Not Found");
  }
});

router.get("/brands", async (req, res) => {
  const connection = centrulConnection.db.collection(
    `${req.body.slug}commoninfo`
  );
  let brandsCollection = (
    await connection.find({ title: "commoninfo" }, { brands: 1 }).toArray()
  )[0].brands;

  brandsCollection.push(
    brandsCollection.splice(brandsCollection.indexOf("unknown"), 1)[0]
  );

  res.status(200).send(brandsCollection);
});

router.get("/:slug", nestedData, (req, res) => {
  res.status(200).send(req.body.data);
});
export default router;

// LEGEND
