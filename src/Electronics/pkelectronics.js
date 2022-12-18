// homeappliances

import axios from "axios";
import imageToBase64 from "image-to-base64";
import { JSDOM } from "jsdom";
import connectToMongo from "../connection.js";

import pkElectronicsModel from "./Schemas/pkelectronics.js";

connectToMongo();

const mainUrl = `https://pkelectronics.pk`;
let it = 0;

function fetchStart({ url, page }) {
  page = page || 1;
  const modefiedUrl = `${url}/page/${page}/?per_page=36`;

  axios
    .get(modefiedUrl)
    .then(async ({ data }) => {
      const html = new JSDOM(data).window.document;
      const categoryArr = html.querySelectorAll(
        ".products .wd-entities-title > a"
      );

      for (const item of categoryArr) {
        const link = item.getAttribute("href");
        console.log(link);

        try {
          const res = await getPageCards(link);

          const exist = await pkElectronicsModel.exists({ slug: res.slug });

          if (!exist) {
            const db = new pkElectronicsModel(res);
            try {
              const saved = await db.save();
              console.log("Saved In DB :", res.title);
            } catch (error) {
              console.log("Error While inserting into DB!", error);
            }
          } else {
            console.log("Already Exist!");
          }
        } catch (error) {
          console.log(error);
        }
      }

      const hasMore =
        (await axios(`${modefiedUrl}&woo_ajax=1`)).data.nextPage.length > 3
          ? true
          : false;

      if (hasMore) {
        fetchStart({ url, page: page + 1 });
      } else {
        console.log("Fineshed");
        return;
      }
    })
    .catch((err) => {
      console.log("Error while Fetching Category!", err);
    });
}

fetchStart({ url: `${mainUrl}/product-category/kitchen-appliances`, page: 1 });

async function getPageCards(link) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get(link);

      const html = new JSDOM(data).window.document;

      const obj = await nestedSpecs(html);
      console.log(it);
      it++;

      resolve(obj);
    } catch (error) {
      reject(error);
    }
  });
}

async function nestedSpecs(html) {
  const title = html.querySelector(".product_title").textContent.trim();

  const slug = title
    .replace(/[\s,\/\-+\–]/g, "-")
    .replace(/\-+/g, "-")
    .toLowerCase();

  const price = html.querySelector(
    ".row.product-image-summary-inner .col-lg-6.col-12.col-md-6.text-left.summary.entry-summary .summary-inner .price ins bdi"
  )
    ? html
        .querySelector(
          ".row.product-image-summary-inner .col-lg-6.col-12.col-md-6.text-left.summary.entry-summary .summary-inner .price ins bdi"
        )
        .textContent.trim()
    : html
        .querySelector(
          ".row.product-image-summary-inner .col-lg-6.col-12.col-md-6.text-left.summary.entry-summary .summary-inner .price bdi"
        )
        .textContent.trim();

  const brandSelect = html.querySelector(
    ".woocommerce-product-attributes-item.woocommerce-product-attributes-item--attribute_pa_brand td"
  );
  const brand = brandSelect && brandSelect.textContent.trim();

  const img = html.querySelector(".woocommerce-product-gallery__image a");

  const imageStr = img ? await imageToBase64(img.href) : null;

  const categories = [
    ...html.querySelectorAll(".product_meta .posted_in a"),
  ].map((item) => {
    return item.textContent;
  });

  const shortDescLi = [
    ...html.querySelectorAll(
      ".woocommerce-product-details__short-description ul li"
    ),
  ].map((item) => item.textContent.trim());

  const shortDescP = [
    ...html.querySelectorAll(
      ".woocommerce-product-details__short-description p"
    ),
  ].map((item) => item.textContent.trim());

  const shortDesc = shortDescLi.length === 0 ? shortDescP : shortDescLi;

  const obj = {
    title: title,
    price: price,
    brand,
    slug,
    categories,
    shortDesc,
    img: imageStr,
  };

  return obj;
}
