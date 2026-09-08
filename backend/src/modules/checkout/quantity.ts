export function checkoutQuantity(input: unknown, min: number | null, stock: number | null): number {
  const minimum=Math.max(1,Number(min)||1);
  const quantity=input == null ? minimum : Number(input);
  if(!Number.isInteger(quantity) || quantity<1 || quantity>99) throw Error('invalid_quantity');
  if(quantity<minimum) throw Error('min_quantity_not_met');
  if(stock!=null && quantity<Infinity && quantity>Number(stock)) throw Error('insufficient_stock');
  return quantity;
}
