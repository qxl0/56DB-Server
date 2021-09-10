import { EntityManager } from "typeorm";

export type MyContext = {
    em: EntityManager; 
};
