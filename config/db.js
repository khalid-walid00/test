const mongoose = require('mongoose');

mongoose.connect(process.env.DB_Url)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
