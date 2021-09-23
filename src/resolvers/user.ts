import argon2 from 'argon2';
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { getConnection } from "typeorm";
import { v4 } from 'uuid';
import { FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entity/user";
import { sendEmail } from "../utils/sendEmail";
import { UsernamePasswordInput } from "./UsernamePasswordInput";

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}
@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?:  FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}


@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async ChangePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req }: MyContext
    ) : Promise<UserResponse>{

        if (newPassword.length <= 2){
            return {errors: [
                {
                    field: "newPassword",
                    message: "length must be greater than 2",
                }
            ]};
        }

        const key = FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);
        if (!userId){
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired"
                    }
                ]
            };
        }

        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum);
        if (!user){
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists"
                    }
                ]
            };
        }

        await User.update({id: userIdNum},
            { password: await argon2.hash(newPassword)});

        // the token is deleted from redis
        await redis.del(key);


        // log on after changed password
        req.session.userId = user.id;

        return { user };
    }



    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis}: MyContext
    ){
        const user = await User.findOne({ where: { email } });
        console.log("user: ", user);
        if (!user){
            // email is not in the db
            return true;
        }

        const token=v4();
        await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "ex", 1000*60*60*24*3);
        await sendEmail(email, 
                    `<a href="http://localhost:3000/change-password/${token}">reset passwqord</a>`
            );
        return true;
    }


    @Query(() => User, {nullable: true})
    async me(
        @Ctx() { req}: MyContext
    ){
        console.log("session: ", req.session);

        if (!req.session.userId){
            return null;
        }

        return await User.findOne(req.session.userId); 
    }
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {req}: MyContext
    ): Promise<UserResponse> {
        let user;
    try {
        const hashedPassword = await argon2.hash(options.password);
        // User.create({}).save()
        // const result =  await getConnection()
        // .createQueryBuilder()
        // .insert()
        // .into(User)
        // .values({
        //     username: options.username,
        //     email: options.email,
        //     password: hashedPassword,
        //     createdAt: new Date(),
        //     updatedAt: new Date()
        // })
        // .returning("*")
        // .execute();
        let myuser = { username: options.username, 
                          email: options.email, 
                          password: hashedPassword, 
                          createdAt: new Date(), 
                          updatedAt: new Date() };
        user = await User.create(myuser).save();

        console.log("result: ", user);

        // user = result.raw[0];
    } catch(err){
      if (err.code == "23505") {
          // duplate username error
          return {
              errors: [{
                  field: 'username',
                  message: 'user name has alreaddy been taken'
              }],
          }
      }
      console.log("error message is: ", err);
    }

    console.log("i am user: ", user); 
    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req.session.userId = user.id;

    return {user};
  }


    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() {req}: MyContext
    ): Promise<UserResponse> {

        const user = await User.findOne( 
            usernameOrEmail.includes('@')? {where: {email: usernameOrEmail }}:
            {where: {username: usernameOrEmail}}
        );
        if (!user) {
            return {
                errors: [
                    {
                        field: 'usernameOrEmail',
                        message: "user name doesn''t exist "
                    }
                ],
            }
        };
        const valid = await argon2.verify(user.password, password);
        if (!valid){
            return {
                errors: [
                    {
                        field: 'password',
                        message: "incorrect password"
                    }
                ],
            };
        }

        console.log("user in seesion is: ", req.session.userId)
        req.session.userId = user.id;
        console.log("user after set seesion is: ", req.session.userId)

        return {
            user,
        };
    }

    @Mutation(()=>Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ) {
        return new Promise(resolve => req.session.destroy(err => {
            res.clearCookie('qid');
            if (err){
                console.log(err);
                resolve(false);
                return;
            }
            resolve(true);
        })
        );
    }

}
