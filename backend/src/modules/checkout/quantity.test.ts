import {expect,test} from 'bun:test';
import {checkoutQuantity} from './quantity';
test('student set minimum cannot be bypassed; teacher/home stay at one',()=>{for(const n of [1,2])expect(()=>checkoutQuantity(n,3,20)).toThrow('min_quantity_not_met');expect(checkoutQuantity(3,3,20)).toBe(3);expect(checkoutQuantity(1,1,20)).toBe(1);});
test('zero, fractional, excessive and unavailable quantities are rejected',()=>{for(const n of [0,-1,1.5,100,Infinity])expect(()=>checkoutQuantity(n,1,null)).toThrow('invalid_quantity');expect(()=>checkoutQuantity(1,1,0)).toThrow('insufficient_stock');});
