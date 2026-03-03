import jwt, { SignOptions } from "jsonwebtoken";
import { ITokenPayload } from "../modules/auth/interfaces/auth.interface";
import { config } from "../config";

export const generateAccessToken = (payload: ITokenPayload): string => {
    const options: SignOptions = {
        expiresIn: config.JWT_ACCESS_EXPIRATION as jwt.SignOptions["expiresIn"],
    };
    return jwt.sign({ ...payload }, config.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
    const options: SignOptions = {
        expiresIn: config.JWT_REFRESH_EXPIRATION as jwt.SignOptions["expiresIn"],
    };
    return jwt.sign({ ...payload }, config.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): ITokenPayload => {
    
    let result = jwt.verify(token, config.JWT_ACCESS_SECRET,{ignoreExpiration:true}) as ITokenPayload;
    
    return result;
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as ITokenPayload;
};
