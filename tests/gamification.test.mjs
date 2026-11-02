import test from 'node:test';
import assert from 'node:assert/strict';

// Test level calculation progression logic (Level 1-5: 300 XP, 6-10: 600 XP, 11-20: 1000 XP, 21+: 2000 XP)
function calculateLevel(xp) {
  if (xp < 0) return 1;
  let remainingXP = xp;
  let level = 1;

  while (true) {
    let needed = 300;
    if (level >= 20) needed = 2000;
    else if (level >= 10) needed = 1000;
    else if (level >= 5) needed = 600;

    if (remainingXP >= needed) {
      remainingXP -= needed;
      level++;
    } else {
      break;
    }
  }
  return level;
}

test('calculateLevel progression tests', async (t) => {
  await t.test('Level 1 at 0 XP', () => {
    assert.equal(calculateLevel(0), 1);
  });

  await t.test('Level 1 at 299 XP', () => {
    assert.equal(calculateLevel(299), 1);
  });

  await t.test('Level 2 at 300 XP', () => {
    assert.equal(calculateLevel(300), 2);
  });

  await t.test('Progression scales correctly for higher levels', () => {
    // 4 levels of 300 XP = 1200 XP -> Level 5
    assert.equal(calculateLevel(1200), 5);
    // Level 5 requires 600 XP to reach Level 6 -> 1800 XP total
    assert.equal(calculateLevel(1800), 6);
  });
});

test('Achievement Criteria verification logic', async (t) => {
  const criteria = { type: 'learning_entries', value: 10 };
  const userStats = { learning_entries: 12 };
  
  const isEligible = userStats[criteria.type] >= criteria.value;
  assert.equal(isEligible, true);

  const insufficientStats = { learning_entries: 9 };
  assert.equal(insufficientStats[criteria.type] >= criteria.value, false);
});

