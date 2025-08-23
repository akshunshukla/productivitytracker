import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/user/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find if a user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // If user exists, pass them to the next step
          return done(null, user);
        } else {
          // If user doesn't exist, create a new one
          const newUser = await User.create({
            googleId: profile.id,
            fullname: profile.displayName,
            email: profile.emails[0].value,
            // Create a username from the email, or you can prompt the user for one later
            username: profile.emails[0].value.split("@")[0],
            avatar: profile.photos[0].value,
            // Password is not set for Google users
          });
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// These are not strictly necessary for JWT but are good practice for Passport
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
