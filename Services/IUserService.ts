import { ClassType, CResponse } from "../Util/Helpers";

export interface IUserService{
    login(username : string, password : string) : Promise<CResponse>;
}

export const IUserService = class Dummy {} as ClassType<IUserService>;