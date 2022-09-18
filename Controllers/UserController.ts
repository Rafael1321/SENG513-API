import 'reflect-metadata';

import { Post, Req, Res } from "routing-controllers";
import { Inject, Service } from "typedi";
import { IUserService } from '../Services/IUserService';
import { CustomResponse, StatusCodes } from '../Util/Helpers';
import { IUserController } from "./IUserController";

@Service()
export class UserController implements IUserController {

    @Inject()
    private userService! : IUserService;

    @Post('/login')
    public async login(@Req() req : any, @Res() res : any) : Promise<void> {
        try{
            const {username, password} = req.body
            const result : CustomResponse = await this.userService.login(username, password);
            return res.type('json').status(result.Status).send(result.Data);       
        }catch(err : any){
            return res.type('json').status(StatusCodes.InternalServerError).send(err.toString());
        }
    }
}