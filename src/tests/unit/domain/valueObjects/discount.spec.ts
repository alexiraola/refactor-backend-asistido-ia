import { describe, it, expect } from 'vitest';
import { Discount } from '../../../../domain/valueObjects/discount';

describe('Discount', () => {
  it('should create a discount from a valid code', () => {
    const discount = Discount.fromCode('DISCOUNT20');
    expect(discount.isOk()).toBe(true);
  });

  it('should apply the discount to a price', () => {
    const discount = Discount.fromCode('DISCOUNT20').get();

    expect(discount.apply(100)).toBe(80);
    expect(discount.apply(200)).toBe(160);
  });

  it('should not apply the discount to a price if the code is invalid', () => {
    const discount = Discount.fromCode('INVALID').get();

    expect(discount.apply(100)).toBe(100);
  });
});
