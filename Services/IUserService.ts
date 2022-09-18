import { ClassType, CustomResponse } from "../Util/Helpers";

export interface IUserService{
    login(username : string, password : string) : Promise<CustomResponse>;
}

export const IUserService = class Dummy {} as ClassType<IUserService>;