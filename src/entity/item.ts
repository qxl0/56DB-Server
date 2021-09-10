import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class Item extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  ID: number;

  @Field(() => String)
  @CreateDateColumn()
  LastUpdated: Date;

  @Field()
  @Column()
  Description: string;

  @Field()
  @Column()
  Price: number;

  @Field()
  @Column()
  Cost: number;

  @Field()
  @Column()
  Quantity: number;
}
