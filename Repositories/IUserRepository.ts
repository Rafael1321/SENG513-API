import { ClassType, CustomResponse } from "../Util/Helpers";

export interface IUserRepository{
    findByUserName(username : string) : Promise<CustomResponse>;
}
  
export const IUserRepository = class Dummy {} as ClassType<IUserRepository>;