import { Arg, Ctx, Int, Mutation, Query, Resolver, ObjectType, Field } from 'type-graphql';
import { Item } from '../entity/Item';
import { MyContext } from '../types';

@ObjectType()
class PaginatedItems{
    @Field(() => [Item])
    items: Item[]
    @Field()
    hasMore: boolean
}

@Resolver()
export class ItemResolver {
  @Query(()=> [Item])
  items(
    @Ctx() { em }: MyContext
  ): Promise<Item[]> {
    return  em.find(Item, {Price: 40}); 
  }

  @Query(()=> PaginatedItems)
  async itemsPaginated(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, {nullable: true}) cursor: string | null,
    @Ctx() { em }: MyContext
  ): Promise<PaginatedItems> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const qb = em.createQueryBuilder(Item, 'item')
      .take(realLimitPlusOne);
    if (cursor) {
      qb.where('item.id < :cursor', {cursor: cursor});
      qb.orderBy('item.id', 'ASC');
    };
    const items = await qb.getMany();

    return {items: items.slice(0, realLimit), 
      hasMore: items.length === realLimitPlusOne};
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
  async queryitems(
    @Arg('desc', () => String) desc: string,
    @Ctx() { em }: MyContext
  ): Promise<Item[]> {
    // return  em.find(Item, {Description: desc}); 
    const items = await em.createQueryBuilder(Item, 'item')
      .where('item.Description like :desc', {desc: `${desc}%`})
      .getMany();
    return items;
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