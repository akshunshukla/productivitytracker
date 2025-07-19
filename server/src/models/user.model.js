import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [20, "Username must be less than 20 characters"]
        },
        fullname: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            maxlength: [50, "Full name must be less than 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"]
        },
        currentStreak: {
            type: Number,
            default: 0,
            min: 0
        },
        lastActiveDate: {
            type: Date,
            default: null
        },
        refreshToken: {
            type: String
        },
        aiInsights: {
            topPerformingTags: {
                type: [String],
                default: []
            },
            improvementAreaTags: {
                type: [String],
                default: []
            },
            peakProductiveTime: {
                type: String,
                default: "Not enough data"
            },
            habitAnalysis: {
                type: String,
                default: "Keep tracking your sessions to get personalized insights!"
            }
        }
    },
    {
        timestamps: true
    }
);

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.isPasswordCorrect = async function(password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        return false;
    }
};

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
        }
    );
};

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
        }
    );
};

export const User = mongoose.model("User", userSchema);