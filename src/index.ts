import "reflect-metadata";
import { createConnection } from 'typeorm';
import express from 'express';
import {ApolloServer  } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { ItemResolver } from './resolvers/item';
import { Item } from "./entity/Item";

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
        Item
      ],
      options: { "encrypt": false }
    })
  console.log("conn is open", conn.isConnected);
  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      // resolvers: [__dirname + '/src/resolvers/*.ts'],
      resolvers: [ 
        HelloResolver, 
        ItemResolver
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
