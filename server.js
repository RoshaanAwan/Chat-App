import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Needed for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Image Schema
import { Schema, model } from "mongoose";
const imageSchema = new Schema({
  filename: String,
  contentType: String,
  imageBase64: String,
});
const Image = model("Image", imageSchema);

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/imageUploadDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// Multer storage setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Image upload route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const img = fs.readFileSync(req.file.path);
    const encode_image = img.toString("base64");

    const finalImg = {
      filename: req.file.filename,
      contentType: req.file.mimetype,
      imageBase64: encode_image,
    };

    const image = new Image(finalImg);
    await image.save();

    res.json({
      message: "Image uploaded successfully!",
      imageUrl: `/uploads/${req.file.filename}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(5000, () => console.log("Server running on port 5000"));
