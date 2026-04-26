import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    name:{
        type: String,
        default: ""
    },
    role:{
        type: String,
        enum: ["user", "admin", "superadmin"],
        default: "user"
    },
    status:{
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    }
},{
    timestamps: true
})

export default mongoose.model("User", userSchema);