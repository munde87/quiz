const mongoose = require('mongoose');
require('dotenv').config();

const mongo_url = process.env.MONGO_URI;  // ✅ use correct env variable
console.log("MONGO_URI:", mongo_url);

mongoose.connect(mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected...');
})
.catch((err) => {
    console.log('MongoDB Connection Error: ', err);
});
