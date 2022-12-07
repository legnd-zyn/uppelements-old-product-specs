import express, { json } from "express";
import mobiles from "./routes/mobile.js";
import cors from "cors";

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

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

dotenv.config();

app.use("/api/mobiles", mobiles);

app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

const PORT = 8080 || process.env.PORT;

app.listen(PORT, () => {
  console.log(`Running at port ${PORT}`);
});
