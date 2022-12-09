// homeappliances

import axios from "axios";
import { JSDOM } from "jsdom";
import randomUserAgent from "random-useragent";
import randomip from "random-ip";

// console.log(randomip("210.137.86.101", 24));

const mainUrl = "https://homeappliances.pk/all-products";

// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36
// X-Requested-With: XMLHttpRequest

const config = () => {
  return {
    headers: {
      Referer: "https://homeappliances.pk",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "User-Agent": randomUserAgent.getRandom(),
    },
    proxy: {
      protocol: "https",
      host: "localhost",
      port: 8080,
    },
  };
};

async function myapp() {
  return await axios
    .get("https://homeappliances.pk/all-products/page/3/?_=1670600090667", {
      headers: {
        accept: "text/html, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: "https://homeappliances.pk/all-products/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    })
    .catch((err) => err);
}

for (let i = 0; i < 100; i++) {
  myapp().then((data) => {
    console.log(data);
  });
}

// axios
//   .get(`${mainUrl}/`, { ...config() })
//   .then(async ({ data }) => {
//     const document = new JSDOM(data).window.document;
//     const resultCountStr = document
//       .querySelector(".woocommerce-result-count")
//       .textContent.trim();

//     let thenum = resultCountStr.replace(/.*\D(?=\d)|\D+$/g, "");
//     const numOfPages = 1; //Math.ceil(thenum / 16);

//     console.log(numOfPages);

//     for (let i = 1; i <= numOfPages; i++) {
//       const data = await eachPageCards(i);
//     }
//   })
//   .catch((err) => {
//     console.log("Error in First Fetch!" + err);
//   });

const eachPageCards = (i) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get(`${mainUrl}/page/${i}`, {
        ...config(),
      });

      const html = new JSDOM(data).window.document;
      html
        .querySelectorAll(".woocommerce-LoopProduct-link")
        .forEach(async (anchortag, index, arr) => {
          const link = anchortag.getAttribute("href");
          const obj = await getNestedInfo(link);

          if (index == arr.length - 1) {
            console.log("Fineshed");
            resolve("done");
          }
        });
    } catch (error) {
      console.log(`Error While Fetching Page ${i}`);
    }
  });
};

const getNestedInfo = (link) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get(link, {
        ...config(),
      });

      const html = new JSDOM(data).window.document;
      const title = html.querySelector(".product_title").textContent;
      console.log(title);
    } catch (error) {
      console.log("Error while Nesting", error);
    }
  });
};
