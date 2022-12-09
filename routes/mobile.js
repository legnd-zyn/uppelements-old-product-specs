import express from "express";
import centrulDbMobiles from "../src/Schema/centrulDbSchema.js";
import mobilesCommonInfoModel from "../src/Schema/mobilesCommonInfoSchema.js";

const router = express.Router();
import connect from "../src/connection.js";

connect();

// MiddleWare
async function filter(req, res, next) {
  let step = 20;
  const limit = req.query.limit;
  let range = limit < 20 ? limit : 20;

  const minprice = req.query.minprice;
  const maxprice = req.query.maxprice;

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

  const arr = await centrulDbMobiles
    .find(finalObj)
    .skip(step * req.query.page - 20)
    .limit(range);

  const count = await centrulDbMobiles.countDocuments(finalObj);

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
  const nestedData = await centrulDbMobiles.find({ slug: req.params.slug });

  const { title, price, brand, slug, detailedSpecs } = nestedData[0];

  req.body.data = { title, price, brand, slug, detailedSpecs };
  next();
};

async function getLwImg(req, res, next) {
  if (req.params.slug) {
    const imgStr = await centrulDbMobiles.find({ slug: req.params.slug });

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
  const brands = await mobilesCommonInfoModel.find(
    { title: "commoninfo" },
    { brands: 1 }
  );

  res.status(200).send(brands[0].brands);
});
router.get("/:slug", nestedData, (req, res) => {
  res.status(200).send(req.body.data);
});
export default router;
// LEGEND
