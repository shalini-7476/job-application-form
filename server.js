const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const Application = require("./models/Application");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

/* ================= MONGODB ATLAS ================= */
mongoose
  .connect(
    "mongodb+srv://admin:admin123@cluster0.qdcum.mongodb.net/job_application",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

/* ================= MULTER ================= */
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/* ================= VALIDATION ================= */
function hasEmptyFields(body) {
  return Object.values(body).some(
    value =>
      value === undefined ||
      value === null ||
      value.toString().trim() === ""
  );
}

/* ================= HOME ================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ================= SUBMIT ================= */
app.post("/submit", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Photo is required" });
    }

    if (hasEmptyFields(req.body)) {
      return res.status(400).json({ message: "All fields are mandatory" });
    }

    /* ================= SAVE TO DB ================= */
    const saved = await Application.create({
      ...req.body,
      photo: req.file.filename
    });

    /* ================= PDF AUTO DOWNLOAD ================= */
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Application_${saved._id}.pdf`
    );

    doc.pipe(res);

    /* ================= BORDER ================= */
    doc.rect(30, 30, 535, 782).stroke();

    /* ================= HEADER ================= */
    const logoPath = path.join(__dirname, "public", "logo.jpeg");
    const photoPath = path.join(__dirname, "uploads", saved.photo);

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 70 });
    }

    if (fs.existsSync(photoPath)) {
      doc.image(photoPath, 455, 45, { width: 90, height: 110 });
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("7S IQ PRIVATE LIMITED", 0, 55, { align: "center" });

    doc
      .font("Helvetica")
      .fontSize(11)
      .text("Application Form", { align: "center" });

    /* ================= CONTENT ================= */
    let y = 180;
    const labelX = 70;
    const valueX = 230;
    const gap = 14;

    const section = title => {
      doc.font("Helvetica-Bold").fontSize(12).text(title, labelX, y);
      y += 18;
      doc.font("Helvetica").fontSize(11);
    };

    const row = (label, value) => {
      doc.text(label, labelX, y);
      doc.text(": " + (value || "-"), valueX, y);
      y += gap;
    };

    section("APPLICATION DETAILS");
    row("Date of Application", saved.applicationDate);
    row("Position Applied For", saved.position);
    row("Employment Type", saved.employmentType);
    y += 8;

    section("PERSONAL INFORMATION");
    row("Full Name", saved.fullname);
    row("Address", saved.address);
    row("Phone Number", saved.phone);
    row("Email ID", saved.email);
    row("Date of Birth", saved.dob);
    row("Aadhaar Number", saved.aadhar);
    y += 8;

    section("EDUCATIONAL BACKGROUND");
    row("Degree / Course", saved.degree);
    row("University / Institute", saved.institute);
    row("Year of Passing", saved.year);
    row("Grade", saved.grade);
    row("City", saved.city);
    y += 8;

    section("EMPLOYMENT HISTORY");
    row("Company", saved.company);
    row("Position", saved.positionHistory);
    row("Year", saved.yearHistory);
    row("Reason for Leaving", saved.reason);
    y += 8;

    section("SKILLS & TRAINING");
    row("Achievement", saved.achievement);
    row("Level", saved.level);
    row("Year", saved.yearSkill);
    row("Institute", saved.skillInstitute);
    y += 8;

    section("FAMILY DETAILS");
    row("Name", saved.familyName);
    row("Relationship", saved.familyRelation);
    row("Occupation", saved.familyOccupation);
    y += 8;

    section("EMERGENCY CONTACT DETAILS");
    row("Name", saved.emergencyName);
    row("Relationship", saved.emergencyRelation);
    row("Occupation", saved.emergencyOccupation);
    row("Qualification", saved.emergencyQualification);
    row("City", saved.emergencyCity);

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
