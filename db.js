const mongoose= require('mongoose');
 const uri="mongodb+srv://ayush132:TsH23wA1V1xbBBzE@cluster0.ivszlkf.mongodb.net/notebook"

const connectToMongo=()=>{
     mongoose.connect(uri)
     console.log("connected to mongo");
}
module.exports= connectToMongo;