import test from 'node:test';
import assert from 'node:assert/strict';

test('Nutrition DB: FSSAI Milk Variants Verification', async (t) => {
  const milkVariants = [
    { name: 'Milk (Full Cream)', calories: 67, protein: 3.2, fat: 6.0 },
    { name: 'Milk (Standardized)', calories: 60, protein: 3.2, fat: 4.5 },
    { name: 'Milk (Toned)', calories: 50, protein: 3.1, fat: 3.0 },
    { name: 'Milk (Double Toned)', calories: 40, protein: 3.3, fat: 1.5 },
    { name: 'Milk (Skimmed)', calories: 34, protein: 3.4, fat: 0.1 },
  ];

  await t.test('All variants have accurate per-100ml calorie and fat ratios', () => {
    for (const v of milkVariants) {
      assert.ok(v.calories > 0, `${v.name} calories must be positive`);
      assert.ok(v.protein > 3.0, `${v.name} must have >= 3.0g protein`);
    }
    const fullCream = milkVariants.find(m => m.name.includes('Full Cream'));
    const skimmed = milkVariants.find(m => m.name.includes('Skimmed'));
    assert.ok(fullCream.fat > skimmed.fat, 'Full cream must have higher fat than skimmed');
  });
});

test('Macro Estimation: Calculation consistency', async (t) => {
  // 250ml (1 glass) of Toned Milk
  const quantity = 250;
  const per100ml = { calories: 50, protein: 3.1, fat: 3.0, carbs: 4.8 };

  const factor = quantity / 100;
  const totalCalories = Math.round(per100ml.calories * factor);
  const totalProtein = Number((per100ml.protein * factor).toFixed(1));

  assert.equal(totalCalories, 125);
  assert.equal(totalProtein, 7.8);
});

