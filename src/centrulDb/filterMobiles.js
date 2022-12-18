import connection from "../connection.js";
import PriceOye from "../Schema/PriceOyeSchema.js";
import WhatMobile from "../Schema/whatMobileSchema.js";
import CentrulMobileDB from "../Schema/centrulDbSchema.js";
import mobilesCommonInfoModel from "../Schema/mobilesCommonInfoSchema.js";

connection()
  .then(async () => {
    const priceOye = await PriceOye.find().sort({ id: 1 });

    for (const mobile of priceOye) {
      const obj = filterForPriceOye(mobile);
      const exist = await CentrulMobileDB.exists({ title: obj.title });

      if (!exist) {
        const specs = new CentrulMobileDB(obj);
        specs.save((err) => {
          if (err) {
            console.log("Error While Saveing into Central DB", obj.title);
          } else {
            console.log("Saved Sucessfully");
          }
        });
      } else {
        console.log("Already Exist ", obj.title);
      }
    }
  })
  .then(async () => {
    const Mobiles = await WhatMobile.find();

    for (const Mobile of Mobiles) {
      const obj = filterForWhatMobile(Mobile);

      const exist = await CentrulMobileDB.exists({ title: Mobile.title });

      if (!exist) {
        const specs = new CentrulMobileDB(obj);

        specs.save((err) => {
          if (err) {
            console.log("Error While Saveing into Central DB", obj.title);
          } else {
            console.log("Saved Sucessfully");
          }
        });
      } else {
        console.log("Already Exist", obj.title);
      }
    }
  })
  .then(async () => {
    const arr = (await CentrulMobileDB.find())
      .map((item) => item.brand)
      .filter(function (item, pos, self) {
        return self.indexOf(item) == pos;
      });

    const exist = await mobilesCommonInfoModel.exists({ title: "commoninfo" });
    if (!exist) {
      const commonInfo = new mobilesCommonInfoModel({ brands: arr });
      commonInfo.save((err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Brands Saved Sucessfully!");
        }
      });
    } else {
      mobilesCommonInfoModel
        .findOneAndUpdate(
          { title: "commoninfo" },
          {
            brands: arr,
          }
        )
        .exec(() => {
          console.log("Updated");
        });
    }
  });

function filterForWhatMobile(mobile) {
  let obj = {
    title: mobile.title,
    price: convertToNumber(mobile.price),
    slug: removeSlash(mobile.nestedUrl),
    brand: getBrand(mobile.title),
    icon: mobile.imgStr,
    detailedSpecs: iterateSpecsForWhatMobile(mobile.detailedSpecs),
  };
  return obj;
}

function iterateSpecsForWhatMobile(specs) {
  let arr = [];

  if (!specs) return;
  for (let [key, values] of Object.entries(specs.specs)) {
    const obj = { title: key, value: [] };

    for (let [key, value] of Object.entries(values)) {
      obj.value.push({
        title: key,
        value: value,
      });
    }

    arr.push(obj);
  }

  return arr;
}

function getBrand(value) {
  return value.split(" ")[0].toLowerCase();
}

function filterForPriceOye(mobile) {
  let obj = {
    title: mobile.title,
    price: convertToNumber(mobile.salePrice),
    slug: mobile.dataSlug,
    brand: mobile.dataBrand,
    icon: mobile.image,
    detailedSpecs: iterateSpecs(mobile.detailedSpecs),
  };

  return obj;
}

function removeSlash(data) {
  const str = data[0] == "/" ? data.slice(1) : data;

  return str;
}

function convertToNumber(value) {
  if (value == "Coming Soon" || value == "N/A") {
    return 0;
  } else {
    return parseInt(value.replace(/(^\D+|,)/g, ""));
  }
}

function iterateSpecs(specs) {
  let arr = [];

  for (let [key, values] of Object.entries(specs.specs)) {
    const obj = { title: key, value: [] };

    for (let [key, value] of Object.entries(values)) {
      obj.value.push({
        title: key,
        value: value,
      });
    }

    arr.push(obj);
  }

  if (specs.varient.colors) {
    const clrobj = { title: "colors", value: [] };
    for (const [key, value] of Object.entries(specs.varient.colors)) {
      clrobj.value.push(value.color);
    }
    arr.push(clrobj);
  }

  if (specs.varient.storage) {
    const storage = { title: "storage", value: [] };

    for (const [key, value] of Object.entries(specs.varient.storage)) {
      storage.value.push(value);
    }
    arr.push(storage);
  }

  return arr;
}
