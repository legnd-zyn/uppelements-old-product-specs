import express from "express";
import mobilesCommonInfoModel from "../src/Schema/mobilesCommonInfoSchema.js";

const router = express.Router();
import connect from "../src/connection.js";

connect();

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const filter = async (req, res, next) => {
  const brandsObj = await mobilesCommonInfoModel.find({ title: "commoninfo" });
  console.log(brandsObj[0].brands);
  const obj = [
    {
      title: "Mobiles",
      linkTo: "/mobiles",
      dropdown: [
        ...brandsObj[0].brands.map((data) => {
          return {
            title: capitalize(data),
            type: "mobiles",
          };
        }),
      ],
    },
  ];
  req.body.data = obj;

  next();
};

router.get("/", filter, (req, res) => {
  res.send(req.body.data);
});

export default router;
