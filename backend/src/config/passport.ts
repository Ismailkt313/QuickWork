import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./index";
import { UserModel } from "../modules/auth/models/user.model";
import { ROLES } from "../constants/roles";

passport.use(
    new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: `${config.url}/api/auth/google/callback`,
    },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                if (!profile.emails || profile.emails.length === 0) {
                    return done(new Error("No email found in Google profile"), false);
                }

                const email = profile.emails[0].value;

                const user = await UserModel.findOne({
                    $or: [{ googleId: profile.id }, { email }]
                });

                if (user) {
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    }

                    if (user.isBlocked) {
                        return done(new Error("Your account has been blocked"), false);
                    }

                    return done(null, user as any);
                }

                const newUser = new UserModel({
                    email,
                    name: profile.displayName,
                    googleId: profile.id,
                    role: ROLES.USER,
                    isService_provider: false,
                    isBlocked: false,
                });
                await newUser.save();
                return done(null, newUser as any);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

export default passport;