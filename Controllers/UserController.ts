import { Post, Req, Res } from "routing-controllers";
import { Inject, Service } from "typedi";
import { UserService } from '../Services/UserService';
import { CResponse, StatusCodes } from '../Util/Helpers';

type Test = {
    name : string;
}

@Service()
export class UserController{

    @Inject()
    private userService! : UserService;

    @Post('/login')
    public async login(@Req() req : any, @Res() res : any) : Promise<void> {
        try{
            const {username, password} = req.body
            const result : CResponse = await this.userService.login(username, password);
            return res.type('json').status(result.Status).send(result.Data);       
        }catch(err : any){
            return res.type('json').status(StatusCodes.InternalServerError).send(err.toString());
        }
    }
}