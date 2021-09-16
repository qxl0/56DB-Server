import { Arg, Ctx, Query, Resolver } from 'type-graphql';
import { MyContext } from '../types';
import { Sales } from '../entity/sales';

@Resolver()
export class SalesResolver {
  @Query(()=> [Sales])
  async sales(
    @Arg('startdate', ()=> String) startdate: string,
    @Arg('enddate', ()=> String) enddate: string,
    @Ctx() { em }: MyContext
  ): Promise<Sales[]> {
    const output = await em.query(
      `EXEC MSPOS_Daily_SaleTotalDateRangeSelPR @dtBeginDate=@0, @dtEndDate=@1`,
      [startdate, enddate]); 
    console.log("output is: ", output);
    return output;
  }

}