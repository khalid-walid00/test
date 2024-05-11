const mongoose = require("mongoose")
const schemaPost = new mongoose.Schema(
    {
        title:{
             type:String,
             require:true 
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    }
)
const PostModule = mongoose.model("post",schemaPost)
module.exports = PostModule