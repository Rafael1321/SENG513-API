import { Inject, Service } from "typedi";
import { User } from "../Models/User";
import { UserRepository } from "../Repositories/UserRepository";
import { CResponse, Message, StatusCodes, Types } from "../Util/Helpers";

@Service()
export class UserService{

    @Inject()
    private userRepository! : UserRepository;

    public async login(username : string, password : string) : Promise<CResponse>{

        try{
            // Check if the username exists
            const res : CResponse = await this.userRepository.findByUserName(username);
            
            if(res.Status == StatusCodes.InternalServerError){
                return res; 
            }else if(res.Status == StatusCodes.NotFound){ 
                return new CResponse({msg:"Username was not found."}, Types.Message, res.Status)
            }

            // Get user from response
            const user : User = User.fromObject(res.Data);

            // Check that passwords match 
            if(password !== user.Password){
                return new CResponse({msg:"The password is incorrect."} as Message, Types.Message, StatusCodes.BadRequest)
            }
            
            return new CResponse(user, Types.User, StatusCodes.OK);

        }catch(err : any){
            return new CResponse({msg:err.toString()} as Message, Types.Message, StatusCodes.InternalServerError);
        }
    }
}