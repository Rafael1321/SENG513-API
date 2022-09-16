import { User } from "../Models/User";
import { CResponse, Message, StatusCodes, Types } from "../Util/Helpers";



export class UserRepository{

    // Inject the mongodb or any db context

    public async findByUserName(username : string) : Promise<CResponse>{
        try{
            return new CResponse({}, Types.User, StatusCodes.OK);
        }catch(err : any){
             return new CResponse({msg:err.toString()} as Message, Types.Message, StatusCodes.BadRequest);
        }
    }
}