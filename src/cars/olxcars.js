import axios from "axios";
import imageToBase64 from "image-to-base64";
import { JSDOM } from "jsdom";
import connectToMongo from "../connection.js";
import olxCarsModel from "./schemas/olxcarsmodel.js";
connectToMongo();
// https://www.pakwheels.com/used-cars/search/-/featured_1/?page=1

const mainUrl = "https://www.olx.com.pk";

async function fetchPage({ url }) {
  try {
    const { data: pageHtml } = await axios.get(`${url}`);

    const details = await getDetails(pageHtml);

    console.log(url);

    const dom = new JSDOM(pageHtml).window.document;
    const hasMore = dom.querySelector("._5fd7b300._31a14546").parentElement;

    if (hasMore) {
      console.log("Fetching Next Page");
      console.log(hasMore.href);
      fetchPage({ url: `${mainUrl}${hasMore.href}` });
    } else {
      console.log("Fineshed!");
    }
  } catch (error) {
    console.log("Error while Fetching Page! " + error);
    console.log("Retrying...");
    fetchPage({ url });
  }
}

fetchPage({ url: `${mainUrl}/cars_c84?page=1` });

async function getDetails(pageHtml) {
  const document = new JSDOM(pageHtml).window.document;

  const cars = [...document.querySelectorAll(".c46f3bfe")];
  for (const car of cars) {
    const id = car.querySelector("._41d2b9f3 a").href.replace(/.*\D/g, "");

    const exist = await olxCarsModel.exists({ id: id });

    if (!exist) {
      const obj = await fetchDetailedSpec(car);
      const exist = await olxCarsModel.exists({ id: obj.id });

      if (!exist) {
        try {
          const db = new olxCarsModel(obj);
          console.log(obj.id);
          const saved = await db.save();
          console.log("Saved Successfully! " + obj.title);
        } catch (error) {
          console.log("Error while saving into DB :" + error);
        }
      } else {
        console.log("Already Existed!.");
      }
    } else {
      console.log("Already Existed !");
    }
  }
}

function fetchDetailedSpec(car) {
  return new Promise(async (resolve, reject) => {
    try {
      const href = car.querySelector(".c46f3bfe ._41d2b9f3 > a").href;
      console.log(`${mainUrl}${href}`);
      const { data } = await axios.get(`${mainUrl}${href}`);

      const NPDocument = new JSDOM(data).window.document;
      const title = NPDocument.querySelector(".a38b8112").textContent;
      const price = NPDocument.querySelector("._56dab877").textContent;
      const id = parseInt(
        NPDocument.querySelector("._171225da").textContent.replace(/\D+/g, "")
      );
      const mileage = NPDocument.querySelector(
        "._7f02578b > .fef55ec1"
      ).textContent.replace("•", "-");
      const location = NPDocument.querySelector(
        "._1075545d.e3cecb8b._5f872d11 ._8918c0a8"
      ).textContent;

      const details = [
        ...NPDocument.querySelectorAll("._676a547f .b44ca0b3"),
      ].map((item) => {
        return {
          key: item.firstChild.textContent,
          value: item.lastChild.textContent,
        };
      });

      const description = NPDocument.querySelector("._0f86855a span")
        .textContent.trim()
        .split(/\n/g)
        .map((str) => str.replace("*", "").replace("#", "").replace(/_/g, " "))
        .filter((item) => item.length > 1);

      const features1 = [
        ...NPDocument.querySelectorAll("._59317dec ._4ab34fd4 ._27f9c8ac span"),
      ].map((item) => item.textContent.trim());

      const features =
        features1.length > 0
          ? features1
          : [...NPDocument.querySelectorAll("._27f9c8ac ._66b85548")].map(
              (item) => item.textContent.trim()
            );

      console.log("At imgs");
      const imagsArr = [
        ...NPDocument.querySelectorAll(".image-gallery-slide img"),
      ];

      const images = [];

      try {
        for (const img of imagsArr) {
          const imgStr = await imageToBase64(img.src);
          images.push(imgStr);
        }
      } catch (error) {
        console.log("Error while Fetching Image : ", error);
        reject(`Error While Fetchin Img : ${error}`);
      }

      const obj = {
        title,
        id,
        price,
        mileage,
        location,
        details,
        description,
        features,
        images,
      };
      resolve(obj);
    } catch (error) {
      reject(`Error while Nesting :${error}`);
    }
  });
}
