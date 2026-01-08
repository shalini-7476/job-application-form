const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ================= MONGODB ================= */
mongoose.connect("mongodb://127.0.0.1:27017/jobApplication");

const Application = mongoose.model(
  "Application",
  new mongoose.Schema({}, { strict: false })
);

/* ================= MULTER ================= */
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* ================= SUBMIT FORM ================= */
app.post("/submit", upload.single("photo"), async (req, res) => {
  try {
    const data = req.body;

    /* ❌ PHOTO REQUIRED */
    if (!req.file) {
      return res.status(400).json({ message: "Photo is required" });
    }

    /* ❌ ALL FIELDS REQUIRED */
    for (let key in data) {
      if (!data[key] || data[key].trim() === "") {
        return res.status(400).json({ message: "All fields are mandatory" });
      }
    }

    data.photo = req.file.filename;

    const savedData = await Application.create(data);

    /* ================= CREATE PDF ================= */
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Application_${savedData._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(18).text("Job Application Form", { align: "center" });
    doc.moveDown();

    Object.entries(savedData.toObject()).forEach(([key, value]) => {
      if (key !== "__v") {
        doc.fontSize(11).text(`${key} : ${value}`);
      }
    });

    doc.end();

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* ================= START SERVER ================= */
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
