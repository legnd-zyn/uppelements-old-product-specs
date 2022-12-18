import express, { json } from "express";
import mobiles from "./routes/mobile.js";
import sidebar from "./routes/sidebar.js";
import cors from "cors";
import { centrulConnection } from "./src/connection.js";

const app = express();
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(json());
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config();

app.use("/api/sidebar", sidebar);

app.use(
  "/api/:slug",
  (req, res, next) => {
    // console.log(req.params.slug);
    req.body.slug = req.params.slug;

    next();
  },
  mobiles
);

app.use(express.static(path.join(__dirname, "./dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/index.html"));
});

app.get("/", async (req, res) => {
  const slug = "mobiles";
  const documents = await centrulConnection.db
    .collection(slug)
    .find()
    .toArray();
  console.log(documents);
});

const PORT = 8080 || process.env.PORT;

app.listen(PORT, () => {
  console.log(`Running at port ${PORT}`);
});
