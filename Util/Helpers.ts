// Custom Response
// Wrapper of type Response

export enum StatusCodes {
    OK = 200,
    CreatedAtRoute = 201,
    BadRequest = 400,
    NotFound = 404,
    InternalServerError = 500
}

export enum Types {
    // Models
    User = 1,
    // Messages
    Message = 2,
    Empty = 3
}

export class CResponse{

    private data : object;
    private type : Types;
    private status : StatusCodes;

    public constructor(data : object, type : Types, status : StatusCodes){
        this.data = data;
        this.status = status;
        this.type = type;
    }   

    public get Status() : StatusCodes{
        return this.status;
    }

    public get Data() : object{
        return this.data;
    }

    public get Type() : Types{
        return this.type;
    }
}

export type Message = {
    msg : string;
}