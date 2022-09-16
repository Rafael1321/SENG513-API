export class User{

    public Id : string;
    public RiotId : string;
    public Name : string;
    public UserName : string;
    public Email : string;
    public Password : string;
    public IsAvatarSet : boolean;
    public AvatarImage : string;
    
    public constructor(id : string, riotId : string, name : string, username : string, email : string,
                       password : string, isAvatarSet : boolean = false, avatarImage : string =''){   
        this.Id = id;
        this.RiotId = riotId;
        this.Name = name;
        this.UserName = username;
        this.Email = email;
        this.Password = password;
        this.IsAvatarSet = isAvatarSet;
        this.AvatarImage = avatarImage;
    }

    public static fromObject(data : any) : User{
        try{    
            return new User(data.id, data.riotId, data.name, data.username, data.email, data.password,
                            data.isAvatarSet, data.avatarImage);
        }catch(err : any){
            throw Error("Could not create an User from the provided data.");
        }
    }
}