import { Collection } from "mongodb";
import { ClassType } from "../Util/Helpers";

export interface IMongoContext{
    connect() : void;
    // Collections
    get UserCollection() : Collection;
}

export const IMongoContext = class Dummy {} as ClassType<IMongoContext>;