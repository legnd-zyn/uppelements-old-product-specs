import axios from "axios";
import connection from "../../connection.js";
import jsdom, { JSDOM } from "jsdom";
import imageToBase64 from "image-to-base64";
import WhatMobile from "../../Schema/whatMobileSchema.js";

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", () => {});

function fetchSourceCode(url, fetchFor) {
  return new Promise((resolve, reject) => {
    axios({
      url: url,
    })
      .then(({ data }) => {
        resolve(data);
      })
      .catch((err) => {
        const error = new Error(fetchFor + " " + err.code + " " + err.errno);
        reject(error);
      });
  });
}

const saveToDb = (dataObj) => {
  console.log(dataObj);
  const card = new WhatMobile(dataObj);
  card.save((err, result) => {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Saved", dataObj.title);
    }
  });
};

const iterateCards = (sourceCode) => {
  return new Promise((resolve, reject) => {
    try {
      const document = new JSDOM(sourceCode, { virtualConsole }).window
        .document;

      document
        .querySelectorAll('td[height="51"][width="668"]')
        .forEach(async (card, index) => {
          setTimeout(async () => {
            const outputObj = {};

            const anchorTag = card.querySelector("a");

            const mobileTitle = card.querySelector("h4 a");
            outputObj.title = mobileTitle.innerHTML
              .replace(/<br>/g, " ")
              .trim();

            const exist = await WhatMobile.exists({ title: outputObj.title });

            if (!exist) {
              const nestedUrl = anchorTag.href;
              outputObj.nestedUrl = nestedUrl;

              const imgSrc = anchorTag.querySelector("img").getAttribute("src");
              const imgUrl = `https://www.whatmobile.com.pk/${imgSrc}`;

              try {
                const base64str = await imageToBase64(imgUrl);
                outputObj.imgStr = base64str;
              } catch (error) {
                console.log("Image Fetch Error", error.code);
                console.log(imgUrl);
              }

              const price = card.querySelector("span").textContent;
              outputObj.price = price.trim();

              const url = `https://www.whatmobile.com.pk${nestedUrl}`;

              try {
                const htmlData = await fetchSourceCode(url, "Nested");
                const specs = await getSpecs(htmlData);
                outputObj.detailedSpecs = specs;
              } catch (error) {
                console.log("Detail Specs", error);
              }

              saveToDb(outputObj);
            } else {
              console.log("ALready Exist", outputObj.title);
            }
          }, index * 10000);
        });
      resolve("Sucessfull!");
    } catch (error) {
      console.log("Errro in ForEach", error.code);
    }
  });
};

const getSpecs = (html) => {
  return new Promise((resolve, reject) => {
    const document = new JSDOM(html).window.document;

    let nestedSpecs = {};
    let section = "";

    document.querySelectorAll(".specs tbody tr").forEach((tr, index) => {
      if (tr.className == "RowBG2") {
        const heading = tr
          .querySelector(".specs-mainHeading")
          .textContent.trim();

        nestedSpecs[heading] = {};
      }
    });

    document.querySelectorAll(".specs tbody tr").forEach((tr, index) => {
      if (tr.className == "RowBG2") {
        section = tr.querySelector(".specs-mainHeading").textContent.trim();
      }

      const heading = tr.querySelector(".specs-subHeading")
        ? tr.querySelector(".specs-subHeading").textContent.trim()
        : section;
      const value = tr.querySelector(".specs-value");

      nestedSpecs[section][heading] = value
        ? value.textContent.trim().replace(/\n/, " ")
        : "N/A";
    });

    const detailedSpecs = { specs: nestedSpecs };

    resolve(detailedSpecs);
  });
};

connection()
  .then(async () => {
    const url = "http://www.whatmobile.com.pk/Smartphone_Mobile-Phones";
    const sourceCode = await fetchSourceCode(url, "Page");
    // console.log(sourceCode);
    return sourceCode;
  })
  .then(async (sourceCode) => {
    const manipulateHtml = await iterateCards(sourceCode);

    return manipulateHtml;
  });
// .catch((err) => {
//   console.log(err);
// });
