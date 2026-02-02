const path = require('path');
const fs = require('fs');
const multer = require('multer');
const  {User} = require('./models/users');

// Set up multer for file uploads

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ordoro';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let userAuthCheck;
app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    if (user) {
      res.send(user);
      userAuthCheck = user;
    } else {
      res.status(401).send("Invalid Credentials");
      userAuthCheck = null;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Login failed", details: error });
  }
});

// --- Development stub endpoints for dashboard metrics ---
// Replace static/mock data with real queries as you implement the related models.
app.get('/api/sales/get/:user/totalsaleamount', (req, res) => {
  res.json({ totalSaleAmount: 12500 });
});

app.get('/api/purchase/get/:user/totalpurchaseamount', (req, res) => {
  res.json({ totalPurchaseAmount: 9320 });
});

app.get('/api/store/get/:user', (req, res) => {
  res.json([
    { id: 1, name: 'Central Store' },
    { id: 2, name: 'East Branch' }
  ]);
});

app.get('/api/product/get/:user', (req, res) => {
  res.json([
    { id: 'p1', name: 'Shirt' },
    { id: 'p2', name: 'Notebook' },
    { id: 'p3', name: 'Laptop' },
    { id: 'p4', name: 'Carrots' }
  ]);
});

app.get('/api/sales/getmonthly', (req, res) => {
  res.json({ salesAmount: [10,20,40,50,60,20,10,35,45,70,25,70] });
});


app.post("/api/register", (req, res) => {
  let registerUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
    imageUrl: req.body.imageUrl,
  });

  registerUser
    .save()
    .then((result) => {
      res.status(200).send(result);
      console.log("Signup Successfull");
    })
    .catch((err) => {
      console.log("Signup: ", err);
      res.status(500).send({ error: "Registration failed", details: err });
    });
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Image upload endpoint
app.post('/api/upload-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the relative path or URL to the uploaded file
  res.status(200).json({ url: `/uploads/${req.file.filename}` });
});






const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
  res.send('Ordoro backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
