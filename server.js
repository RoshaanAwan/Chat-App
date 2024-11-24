import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import { GridFSBucket } from "mongodb";
import cors from "cors";
import crypto from "crypto";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = "mongodb://localhost:27017/imageUploadDB";
const conn = mongoose.createConnection(mongoURI, {
  
});

let gfs, gridfsBucket;
conn.once("open", () => {
  gridfsBucket = new GridFSBucket(conn.db, { bucketName: "uploads" }); // Bucket acts like a "folder"
  gfs = gridfsBucket;
  console.log("GridFS connected");
});

// GridFS Storage setup
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename,
          bucketName: "uploads", // Match the bucket name
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

// Upload image route
app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    message: "Image uploaded successfully!",
    imageId: req.file.id, // File ID in GridFS
  });
});

// Fetch image by ID
app.get("/image/:id", async (req, res) => {
  try {
    const file = await gfs.find({ _id: new mongoose.Types.ObjectId(req.params.id) }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).send("Image not found");
    }

    gfs.openDownloadStream(new mongoose.Types.ObjectId(req.params.id))
      .pipe(res)
      .on("error", (err) => {
        res.status(500).send("Failed to fetch image");
      });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching image");
  }
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
