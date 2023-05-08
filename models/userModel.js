const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age:{
    type:String,
    required: true,
},
  contact_number:{
    type:Number,
    required:true,
},
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique:true,
  },
  address : {
    type: String,
    maxlength: 500,
    required:true,
},
  passport:{
    type:String,
    required:true,
}
});

const User = mongoose.model("User",UserSchema);
module.exports = User;
