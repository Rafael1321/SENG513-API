import 'reflect-metadata';

import express from "express"
import cors from 'cors';
import { useContainer, useExpressServer } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { UserController } from './Controllers/UserController';
import * as dotenv from 'dotenv';
import { MongoContext } from './Context/MongoContext';
import { UserRepository } from './Repositories/UserRepository';
import { UserService } from './Services/UserService';
import { IMongoContext } from './Context/IMongoContext';

import { IUserController } from './Controllers/IUserController';
import { IUserService } from './Services/IUserService';
import { IUserRepository } from './Repositories/IUserRepository';


@Service()
class Server{

    private app : express.Application;
    private controllers = [UserController];

    public constructor() {
      this.app = express();
      dotenv.config();

      this.configMiddleware();  // Middleware
      this.configDI();          // Dependency injection
      this.configRoutes();      // Routing REST Controllers
    }

    public start(): void {
        const appPort = 3000
        this.app.listen(appPort, () => {
          console.info(`Starting express server on http://localhost:${appPort}\n`);
        });
    }

    private configMiddleware(){
        this.app.use(cors());
        this.app.use(express.json());
        console.info(`Middleware configured...`);
    }

    private configDI(){
        useContainer(Container);
        Container.set(IMongoContext, Container.get(MongoContext));
        Container.set(IUserService, Container.get(UserService));
        Container.set(IUserRepository, Container.get(UserRepository));
        console.info(`Dependency injection configured...`);
    }

    private configRoutes(){
        useExpressServer(this.app, {
            controllers: this.controllers
        });
        console.info(`REST routes configured...`);
    }
}

const server = Container.get(Server)
server.start();