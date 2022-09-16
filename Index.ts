import 'reflect-metadata';

import express from "express"
import cors from 'cors';
import { useContainer, useExpressServer } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { UserController } from './Controllers/UserController';

@Service()
class Server{

    private app : express.Application;
    private controllers = [UserController];

    public constructor() {
      this.app = express();
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
        useContainer(Container)
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