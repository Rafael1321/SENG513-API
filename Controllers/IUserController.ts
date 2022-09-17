import { ClassType } from "../Util/Helpers";

export interface IUserController{
    login(req : any, res : any) : Promise<void>;
}

export const IUserController = class Dummy {} as ClassType<IUserController>;