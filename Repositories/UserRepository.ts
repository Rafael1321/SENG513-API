import 'reflect-metadata';

import { CResponse, Message, StatusCodes, Types } from "../Util/Helpers";
import { IUserRepository } from './IUserRepository';
import { IMongoContext } from '../Context/IMongoContext';
import { Inject, Service } from "typedi";

@Service()
export class UserRepository implements IUserRepository{

    // Inject the mongodb or any db context
    @Inject()
    private context! : IMongoContext;

    public async findByUserName(username : string) : Promise<CResponse>{
        try{
            const user = await this.context.UserCollection.findOne({username:username});
            if(user === null) return new CResponse({}, Types.Empty, StatusCodes.NotFound);

            return new CResponse(user, Types.User, StatusCodes.OK);
        }catch(err : any){
             return new CResponse({msg:err.toString()} as Message, Types.Message, StatusCodes.BadRequest);
        }
    }
}