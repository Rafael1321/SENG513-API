import { ClassType, CResponse } from "../Util/Helpers";

export interface IUserRepository{
    findByUserName(username : string) : Promise<CResponse>;
}
  
export const IUserRepository = class Dummy {} as ClassType<IUserRepository>;