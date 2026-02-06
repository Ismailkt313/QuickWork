import bcrypt from 'bcrypt'
export const hash = async (password: string):Promise<string>=>{
    return bcrypt.hash(password,10)
}
export const compare = async (password: string, hashedPassword: string): Promise<boolean> => {
    console.log(password,hashedPassword)
    return bcrypt.compare(password,hashedPassword)
}
