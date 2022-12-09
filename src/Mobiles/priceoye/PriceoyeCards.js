import axios from "axios";
import connectToMongo from "../connection.js";
import MobileCard from "../Schema/PriceOyeSchema.js";
import { JSDOM } from "jsdom";
import imageToBase64 from "image-to-base64";
import { finalFetch } from "./cardsNestedInfo.js";

let idCount = 0;

const getHtml = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const htmlData = new JSDOM(data);
      htmlData.window.document
        .querySelectorAll(".productBox")
        .forEach(async (card) => {
          let outPutObj = {};

          const title = card
            .querySelector(".detail-box .p3")
            .textContent.trim();
          outPutObj.title = title;

          const salePrice = card
            .querySelector(".detail-box .price-box")
            .textContent.trim();
          outPutObj.salePrice = salePrice;

          const retailPrice = card.querySelector(
            ".detail-box .price-diff-retail"
          );

          if (retailPrice) {
            outPutObj.retailPrice = retailPrice.textContent.trim();
          }

          const dataBrand = card.getAttribute("data-brand");
          if (dataBrand) {
            outPutObj.dataBrand = dataBrand;
          }

          const dataSlug = card.getAttribute("data-slug");
          if (dataSlug) {
            outPutObj.dataSlug = dataSlug;
          }

          const imageUrl = card
            .querySelector(".product-thumbnail")
            .getAttribute("src");

          outPutObj.id = idCount;
          idCount++;

          try {
            const base64img = await imageToBase64(imageUrl);
            outPutObj.image = base64img;
          } catch (error) {
            console.log("Image Fetch Error ", imageUrl);
          }

          // "cGF0aC90by9maWxlLmpwZw=="

          try {
            const saved = await saveToDb(outPutObj);
            console.log(saved);
          } catch (error) {
            console.log(error);
          }
        });
      resolve("Round Completed");
    } catch (error) {
      reject("Error in ", error.message);
    }
  });
};

const getId = async () => {
  const AllMobiles = await MobileCard.find().sort({ id: 1 });
  const MaxId = Math.max(...AllMobiles.map((item) => item.id));

  idCount = MaxId == "-Infinity" ? 0 : MaxId + 1;
  console.log(idCount);
  return "ID Generated";
};

const saveToDb = (obj) => {
  const { title } = obj;
  return new Promise(async (resolve, reject) => {
    const alreadyExist = await MobileCard.exists({ title: title });
    if (alreadyExist == null) {
      const { specs } = await finalFetch({
        brand: obj.dataBrand,
        slug: obj.dataSlug,
        id: obj.id.toString(),
      });

      const objtostore = { ...obj, detailedSpecs: specs };

      const mobile = new MobileCard(objtostore);
      mobile.save((err, result) => {
        if (err) {
          reject("Error While Creating User" + err);
        } else {
          resolve("Saved " + title);
        }
      });
    } else {
      resolve(title + " Already Existed " + obj.id);
    }
  });
};

connectToMongo()
  .then(async () => {
    const idGenerated = await getId();
    return;
  })
  .then(async () => {
    for (let i = 1; i <= 11; i++) {
      setTimeout(async () => {
        try {
          const { data } = await axios({
            url: `https://priceoye.pk/mobiles?page=${i}`,
          });

          getHtml(data)
            .then(async (message) => {
              console.log(message);
            })
            .catch((err) => {
              console.log("Fetch Error :", err);
            });
        } catch (error) {
          console.log("Fetch Err", error);
        }
      }, i * 5000);
    }
  });
