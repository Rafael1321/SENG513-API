import 'reflect-metadata';

import { Inject, Service } from "typedi";
import { User } from "../Models/User";
import { UserRepository } from "../Repositories/UserRepository";
import { CustomResponse, Message, StatusCodes, Types } from "../Util/Helpers";
import { IUserService } from './IUserService';
import bcrypt from 'bcryptjs';

@Service()
export class UserService implements IUserService{

    @Inject()
    private userRepository! : UserRepository;

    public async login(username : string, password : string) : Promise<CustomResponse>{

        try{
            if(username == undefined || username === '' || username === null) 
                return new CustomResponse({msg:'The username is missing'}, Types.Message, StatusCodes.BadRequest);
            if(password == undefined || password === '' || password === null) 
            return new CustomResponse({msg:'The password is missing'}, Types.Message, StatusCodes.BadRequest);

            // Check if the username exists
            const res : CustomResponse = await this.userRepository.findByUserName(username);
            
            if(res.Status == StatusCodes.InternalServerError){
                return res; 
            }else if(res.Status == StatusCodes.NotFound){ 
                return new CustomResponse({msg:"Username was not found."}, Types.Message, res.Status)
            }

            // Get user from response
            const user : User = User.fromObject(res.Data);

            // Check that passwords match 
            const isPasswordValid = await bcrypt.compare(password, user.Password);
            if(!isPasswordValid){
                return new CustomResponse({msg:"The password is incorrect."} as Message, Types.Message, StatusCodes.BadRequest)
            }
            
            return new CustomResponse(user, Types.User, StatusCodes.OK);

        }catch(err : any){
            return new CustomResponse({msg:err.toString()} as Message, Types.Message, StatusCodes.InternalServerError);
        }
    }
}