const mongoose = require("mongoose")
const schemaUser = new mongoose.Schema(
    {
        name:{
             type:String,
             require:true 
        },
        email:{
            type:String,
            require:true , 
        },
        password:{
            type:String,
            require:true 
        }
    }
)
const UserModule = mongoose.model("User",schemaUser)
module.exports = UserModule