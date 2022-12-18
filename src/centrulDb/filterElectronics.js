import connection from "../connection.js";
import pkElectronicsModel from "../Electronics/Schemas/pkelectronics.js";
import centrulElectronicsModel from "../Schema/centrulElectronicsDB.js";
import electronicsCommonInfoModel from "../Schema/electronicsCommonInfo.js";

connection().then(async () => {
  const cards = await pkElectronicsModel.find();

  for (const card of cards) {
    const obj = reFactor(card);
    const db = new centrulElectronicsModel(obj);
    const exist = await centrulElectronicsModel.exists({ title: obj.title });
    if (!exist) {
      try {
        const saved = await db.save();
        console.log("Saved into db successfully");
      } catch (error) {
        console.log("Could not saved into DataBase!");
      }
    } else {
      console.log("Already Exists!");
    }
  }
  // Filter Brands

  const arr = (await centrulElectronicsModel.find())
    .map((item) => (item.brand === null ? "unknown" : item.brand))
    .filter(function (item, pos, self) {
      return self.indexOf(item) == pos;
    });

  const exist = await electronicsCommonInfoModel.exists({
    title: "commoninfo",
  });
  if (!exist) {
    const commonInfo = new electronicsCommonInfoModel({ brands: arr });
    commonInfo.save((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Brands Saved Sucessfully!");
      }
    });
  } else {
    electronicsCommonInfoModel
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

  // Filter Brands End
});

function reFactor(card) {
  const { title, price, brand, slug, img, categories, shortDesc } = card;
  const obj = {
    title,
    price: removeRs(price),
    brand: brand ? brand.toLowerCase() : "unknown",
    slug,
    icon: img,
    detailedSpecs:
      shortDesc.length > 0
        ? shortDesc.map((item) => item.replace(/•+/g, ""))
        : "none",
  };
  return obj;
}

function removeRs(price) {
  return parseInt(price.replace(/\D+/g, ""));
}
