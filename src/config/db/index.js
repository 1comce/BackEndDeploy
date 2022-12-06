const mongoose = require('mongoose');
async function connect() {
    try {
        await mongoose.connect(
            `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ihu08au.mongodb.net/FullStack?retryWrites=true&w=majority`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
        );
        console.log('Connect successfully!');
    } catch (error) {
        console.log('Connect failure!');
    }
}
module.exports = { connect };