const mongoose = require('mongoose');

const mongoDB = 'mongodb://127.0.0.1:27017/phreddit';

mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    await mongoose.connection.dropDatabase();
    console.log("Database dropped");
    mongoose.disconnect();
}).catch(err => {
    console.error("Error dropping database:", err);
});
