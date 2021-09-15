import "reflect-metadata";
import { createConnection } from 'typeorm';
import express from 'express';
import {ApolloServer  } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { ItemResolver } from './resolvers/item';
import { Item } from "./entity/Item";
import { Sales } from "./entity/Sales";
import cors from 'cors';
import { SalesResolver } from "./resolvers/sales";


const main=async ()=>{
  const conn = await createConnection({ 
      type: "mssql",
      host: "QiangR8",
      port: 1433,
      username: "sa",
      password: "qiangli2",
      database: "56DB",
      synchronize: false,
      logging: true,
      entities: [
        Item,
        Sales
      ],
      options: { "encrypt": false }
    })
  console.log("conn is open", conn.isConnected);
  const app = express();
  
  app.use(cors());

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      // resolvers: [__dirname + '/src/resolvers/*.ts'],
      resolvers: [ 
        HelloResolver, 
        ItemResolver,
        SalesResolver
      ],  
      validate: false
    }),
    context: () => ({ em: conn.manager })
  });


  apolloServer.applyMiddleware({ app });


  app.listen(4000, () => {
    console.log('server started on localhost:4000')
  })
};

main();
