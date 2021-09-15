import { Field,Int, ObjectType } from "type-graphql";
import {
  Column,
  Entity,
  PrimaryColumn
} from "typeorm";

@ObjectType()
@Entity()
export class Sales {
  @PrimaryColumn()
  @Field(() => Int)
  ID: number;

  @Field(() => String)
  @Column({nullable: true, name: "startdate"})
  startdate: Date;

  @Column({nullable: true,name: "enddate"})
  @Field(() => String)
  enddate: Date;

  @Field()
  @Column({nullable: true,name: "SaleAmount"})
  SaleAmount: number;
}
