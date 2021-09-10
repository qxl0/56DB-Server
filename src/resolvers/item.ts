import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { Item } from '../entity/Item';
import { MyContext } from '../types';

@Resolver()
export class ItemResolver {
  @Query(()=> [Item])
  items(
    @Ctx() { em }: MyContext
  ): Promise<Item[]> {
    return  em.find(Item, {}); 
  }

  @Query(()=> Item, {nullable: true})
  item(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Item | undefined> {
    // return Item.findOne(id);
    return em.findOne(Item, {ID: id});
  }

  @Query(()=> [Item])
  queryitems(
    @Arg('desc', () => String) desc: string,
    @Ctx() { em }: MyContext
  ): Promise<Item[]> {
    return  em.find(Item, {Description: desc}); 
  }

  @Mutation(()=> Item)
  async createItem(
    @Arg('description') description: string,
    @Arg('price') price: number,
    @Arg('cost') cost: number,
    @Arg('quantity') quantity: number,
    @Ctx() { em }: MyContext
  ): Promise<Item> {
    const item = em.create(Item, {
      Description: description,
      Price: price,
      Cost: cost,
      Quantity: quantity
    });
    await em.save(item);
    return item;
  }


  @Mutation(()=> Item, {nullable: true})
  async updateItem(
    @Arg('id', () => Int) id: number,
    @Arg('description', ()=>String, {nullable: true}) description: string,
    @Arg('price') price: number,
    @Arg('cost') cost: number,
    @Arg('quantity') quantity: number,
    @Ctx() { em }: MyContext
  ): Promise<Item | null> {
    const item = await em.findOne(Item, {ID: id});
    if (!item) {
      return null;
    }
    if (typeof description !== 'undefined') {
      item.Description = description;
    }
    if (typeof price !== 'undefined') {
      item.Price = price;
    }
    if (typeof cost !== 'undefined') {
      item.Cost = cost;
    }
    if (typeof quantity !== 'undefined') {
      item.Quantity = quantity;
    }
    await em.save(item);
    return item;
  }

  @Mutation(()=> Boolean)
  async deleteItem(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    
    await em.delete(Item, {ID: id});
    return true;
  }
}