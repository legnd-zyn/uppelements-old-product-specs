import connection from "../../connection.js";
import MobileCard from "../../Schema/PriceOyeSchema.js";
import axios from "axios";
import { JSDOM } from "jsdom";

import express, { json } from "express";
const app = express();
app.use(json());

connection();

function getMobileLists() {
  return new Promise(async (resolve, reject) => {
    const mobile = await MobileCard.find().sort({ id: 1 });

    const mobileArr = mobile
      .filter((res) => {
        if (res.detailedSpecs == undefined) {
          return {
            brand: res.dataBrand,
            slug: res.dataSlug,
            id: res._id.toString(),
          };
        }
      })
      .map((res) => {
        if (res.detailedSpecs == undefined) {
          return {
            brand: res.dataBrand,
            slug: res.dataSlug,
            id: res._id.toString(),
          };
        }
      });

    console.log(mobileArr);
    resolve(mobileArr);
  });
}

function fetchSourceCode({ brand, slug, id }) {
  return new Promise((resolve, reject) => {
    const url = `https://priceoye.pk/mobiles/${brand}/${slug}`;

    axios({
      url: url,
    })
      .then(({ data }) => {
        resolve({ data, url, id });
      })
      .catch((err) => {
        console.log("Error in Fetch ReTrying", err.code, url);
        reject("Sorry");
      });
  });
}

function domHandling({ data, url, id }) {
  return new Promise(async (resolve, reject) => {
    const outputObj = { url, id };

    // Main Document
    const document = new JSDOM(data).window.document;

    const price = document.querySelector(".product-price .summary-price");
    outputObj.price = price ? price.textContent.trim() : "Null";

    outputObj.varient = {};

    const storage = [];
    document
      .querySelectorAll(".product-variant-two span")
      .forEach((colorList) => {
        storage.push(colorList.textContent.trim());
      });
    outputObj.varient.storage = storage;

    const specs = {};
    document.querySelectorAll(".p-spec-table").forEach((tables) => {
      const tableHead = tables.querySelector("thead").textContent.trim();
      specs[tableHead] = {};

      tables.querySelectorAll("tbody tr").forEach((row) => {
        const rowHeader = row.querySelector("th").textContent.trim();
        const rowValue = row.querySelector("td").textContent.trim();
        specs[tableHead][rowHeader] = rowValue;
      });
    });

    outputObj.specs = specs;

    const colorBoxContainer = document.querySelector(".product-variant-one");

    let colors = [];
    if (colorBoxContainer) {
      colorBoxContainer.querySelectorAll(".color-name").forEach((colorList) => {
        const obj = {};
        obj.color = colorList.textContent.trim();

        const imageUrl = colorList.parentElement.querySelector(
          ".product-color-image amp-img"
        );

        obj.imageUrl = imageUrl ? imageUrl.getAttribute("src") : "Null";
        colors.push(obj);
      });
    } else {
      colors = null;
    }

    outputObj.varient.colors = colors;

    // console.log(Promise.all());
    resolve(outputObj);
  });
}

export const finalFetch = async (mappedData) => {
  return new Promise((resolve, reject) => {
    try {
      fetchSourceCode(mappedData)
        .then(async ({ data, url, id }) => {
          const outputObj = await domHandling({ data, url, id });
          return { data: outputObj, url, id };
        })
        .then(({ data, url, id }) => {
          const finalData = {
            price: data.price,
            varient: data.varient,
            specs: data.specs,
          };
          console.log(finalData);
          resolve({ url: url, id: id, specs: finalData });
        });
    } catch (error) {
      reject("Cannot Generated Final Data to Save! " + error.code);
    }
  }).catch((err) => console.log("Error in Fetching Source Code!"));
};

const findAndUpdate = ({ id, finalData, url }) => {
  return new Promise((resolve, reject) => {
    MobileCard.findByIdAndUpdate(id, { detailedSpecs: finalData })
      .then(() => {
        resolve("Processedd " + id + " " + url);
      })
      .catch((err) => {
        reject("Couldn't stored to DB " + id + " " + err);
      });
  });
};

getMobileLists()
  .then(async (mappedData) => {
    console.log(mappedData.length);

    for (let i = 0; i < mappedData.length; i++) {
      const data = await finalFetch(mappedData[i]);
      findAndUpdate(data);
    }
  })
  .catch((err) => console.log(err));
