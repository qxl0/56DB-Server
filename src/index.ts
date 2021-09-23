import "reflect-metadata";
import { createConnection } from 'typeorm';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import Redis from 'ioredis';
import "reflect-metadata";
import {ApolloServer  } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './constants';
import { HelloResolver } from './resolvers/hello';
import { ItemResolver } from './resolvers/item';
import { Item } from "./entity/Item";
import { Sales } from "./entity/Sales";
import { User } from "./entity/user";
import { SalesResolver } from "./resolvers/sales";
import { UserResolver } from "./resolvers/user";
import connectRedis from "connect-redis";


const main=async ()=>{
  const conn = await createConnection({ 
      type: "mssql",
      username: "sa",
      // host: "96.245.14.241",
      // password: "loveu",
      // database: "DB56",
      host: "74.109.5.248",
      password: "qiangli2",
      database: "56DB",
      synchronize: false,
      logging: true,
      entities: [
        Item,
        Sales,
        User
      ],
      options: { "encrypt": false }
    })
  console.log("conn is open", conn.isConnected);
  const app = express();
  
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(cors());

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__ // cookie only works in https
      },
      saveUninitialized: false,
      secret: "qiangli",
      resave: false
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      // resolvers: [__dirname + '/src/resolvers/*.ts'],
      resolvers: [ 
        HelloResolver, 
        ItemResolver,
        SalesResolver,
        UserResolver
      ],  
      validate: false
    }),
    context: ({req, res}) => ({ em: conn.manager, req, res, redis })
  });


  apolloServer.applyMiddleware({ app });


  app.listen(4000, () => {
    console.log('server started on localhost:4000')
  })
};

main();
