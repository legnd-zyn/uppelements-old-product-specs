import connectToMongo from "../connection.js";
import carsCommonInfoModel from "./schemas/carscommoninfo.js";
import filterOlxCars from "./schemas/filterolxschema.js";
import olxCarsModel from "./schemas/olxcarsmodel.js";

connectToMongo();

function refactor({
  title,
  id,
  price,
  mileage,
  location,
  details,
  description,
  features,
  images,
}) {
  return new Promise((resolve, reject) => {
    try {
      const finalObj = {
        title,
        price: price.replace(/\D+/g, ""),
        slug: `${title.toLowerCase().replace(/[\n+\s+\/+,+%+]/g, "-")}-${id}`,
        brand: details.find((item) => item.key == "Make").value.toLowerCase(),
        icon: images[0],
        detailedSpecs: details,
        id,
        mileage,
        location,
        description,
        features,
        images,
      };

      resolve(finalObj);
    } catch (error) {
      reject(`Error while refactoring! : ${error}`);
    }
  });
}

function generateCommonInfo() {
  return new Promise(async (resolve, reject) => {
    try {
      const arr = (await filterOlxCars.find())
        .map((item) => (item.brand === null ? "unknown" : item.brand))
        .filter(function (item, pos, self) {
          return self.indexOf(item) == pos;
        });

      const exist = await carsCommonInfoModel.exists({
        title: "commoninfo",
      });
      if (!exist) {
        const commonInfo = new carsCommonInfoModel({ brands: arr });
        commonInfo.save((err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Brands Saved Sucessfully!");
            resolve("Common Info Generated Successfully!");
          }
        });
      } else {
        carsCommonInfoModel
          .findOneAndUpdate(
            { title: "commoninfo" },
            {
              brands: arr,
            }
          )
          .exec(() => {
            console.log("Updated");
            resolve("Updated!");
          });
      }
    } catch (error) {
      reject(`Error while Generating Common Info! ${error}`);
    }
  });
}

const filter = async () => {
  const cars = await olxCarsModel.find();
  for (const car of cars) {
    try {
      const refactoredObj = await refactor(car);

      const exist = await filterOlxCars.exists({ id: refactoredObj.id });
      if (!exist) {
        try {
          const model = new filterOlxCars(refactoredObj);
          const save = await model.save();
          console.log("Saved Successfully!");
        } catch (error) {
          console.log("Error While Saving! ", error);
        }
      } else {
        console.log("Already Exists!");
      }
    } catch (error) {
      console.log(error);
    }
  }
  const commoninfo = await generateCommonInfo();
};

filter();
