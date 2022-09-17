import 'reflect-metadata';

import { Collection, Db, MongoClient } from "mongodb";
import { Service } from "typedi";
import { IMongoContext } from "./IMongoContext";

@Service()
export class MongoContext implements IMongoContext{

    public mongoURI : string;
    private db! : Db;
    private client! : MongoClient;

    // Collections 
    private userCollection! : Collection;

    // Config Objects
    private DBConfig = {
        Username : process.env.MONGO_USER ?? '',
        Password : process.env.MONGO_PASSWORD ?? '',
        Hostname : process.env.MONGO_HOST ?? '',
        Port : process.env.MONGO_PORT ?? '',
    };

    private CollectionConfig = {
        UsersCollection : process.env.MONGO_USERS_COLLECTION ?? '',
    }

    public constructor(){
        this.mongoURI = this.getConnString();
        this.connect();
    }

    private getConnString(): string{
        return `mongodb://${this.DBConfig.Hostname}:${this.DBConfig.Port}`;
    }

    public async connect() : Promise<void> {

        try{
            this.client = new MongoClient(this.mongoURI ?? '');
            await this.client.connect(); 
            this.db = this.client.db(process.env.MONGO_DB ?? '');
                   
            console.info(`Succesfully connected to database: ${process.env.MONGO_DB}`);
    
            await this.createCollections();

        }catch(err : any){
            throw new Error(err.toString());
        }
    }

    private async createCollections(){
        await this.createUserCollection();
    }

    // User Collection 
    public get UserCollection() : Collection {
        return this.userCollection;
    }

    private  async createUserCollection() : Promise<void> {

        try{
            this.userCollection = await this.db.createCollection(this.CollectionConfig.UsersCollection, {
                validator: {
                    $jsonSchema: {
                    bsonType: "object",
                    required: [ "username", "email", "password"],
                    properties: {
                            riotId: {
                                bsonType: "string",
                                minLength: 3,
                                maxLength: 30,
                                uniqueItems: true
                            },
                            name: {
                                bsonType: "string",
                                minLength: 3,
                                maxLength: 60,
                                uniqueItems: false
                            },
                            username: {
                                bsonType: "string",
                                minLength: 3,
                                maxLength: 30,
                                uniqueItems: true
                            },
                            email: {
                                bsonType: "string",
                                uniqueItems: true,
                                maxLength: 50
                            },
                            password: {
                                bsonType: "string",
                                minLength: 8
                            },
                            isAvatarImageSet: {
                                bsonType: "bool" ,
                            },
                            avatarImage: {
                                bsonType: "string",
                            }
                        }
                    }
                }
            });
            console.info(`New collection ${this.CollectionConfig.UsersCollection} created`);
        }catch(err : any){
            this.userCollection = this.db.collection(this.CollectionConfig.UsersCollection);
            console.info(`${this.CollectionConfig.UsersCollection} collection retrieved`);
        }
    }
}