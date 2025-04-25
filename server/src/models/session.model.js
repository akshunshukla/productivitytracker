import mongoose, { Schema } from "mongoose"

const sessionSchema = new Schema(
    {
        userId:{
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        startTime:{
            type : Date,
            required : true
        },
        endTime:{
            type : Date,
            required : true
        },
        duration :{
            type : Number,
            required : true
        },
        tags:{
            type :[String],
            default : []
        },
        isCompleted:{
            type: Boolean,
            default : false
        }
    },
    {timestamps:true}
)

export const Session = mongoose.model("Session",sessionSchema)