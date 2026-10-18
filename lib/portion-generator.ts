import { MenuItemConfig } from '@/config/university';

export type PortionSize = 'Small' | 'Regular' | 'Large';

export interface PortionCardInfo {
  portion: PortionSize;
  title: string;
  fillPercent: number; // 40, 70, 100
  desc: string;
  grams: number;
  calories?: number;
  gramsLabel: string;
  caloriesLabel?: string;
  scale: number;
}

export interface PortionMultipliers {
  small?: number;
  regular?: number;
  large?: number;
}

/**
 * Clean dish name from descriptive prefixes and brackets.
 */
function cleanDishName(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^(stuffed|fresh|steamed|amritsari|south indian|desi ghee|special|halwai style|crispy|hot|cutting|evening|veg)\s+/i, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\/\s*.*$/, '')
    .trim();
}

/**
 * Generate three portion cards (Small, Regular, Large) tailored to the meal,
 * menu items, and calibrated grammage.
 */
export function generatePortionCards(
  dishes: MenuItemConfig[],
  mealType: string,
  multipliers: PortionMultipliers = { small: 0.7, regular: 1.0, large: 1.3 }
): PortionCardInfo[] {
  if (!dishes || dishes.length === 0) {
    return [];
  }

  const smallMult = multipliers.small ?? 0.7;
  const regularMult = multipliers.regular ?? 1.0;
  const largeMult = multipliers.large ?? 1.3;

  // Calculate base grams
  // Only sum food dishes (filter out liquid drinks from weight baseline if dishes exist)
  const solidFoodDishes = dishes.filter(
    (d) => !(d.category === 'Side' && /tea|chai|coffee|milk|water|curd|dahi/i.test(d.name))
  );
  const relevantDishes = solidFoodDishes.length > 0 ? solidFoodDishes : dishes;

  const baseGrams = Math.round(
    relevantDishes.reduce((sum, d) => sum + (d.avgGramsPerPlate || 120), 0)
  );

  // Check if any dish has calorie numbers in menu data
  const dishesWithCalories = dishes.filter(
    (d) => typeof d.calories === 'number' && d.calories > 0
  );
  const baseCalories =
    dishesWithCalories.length > 0
      ? Math.round(dishesWithCalories.reduce((sum, d) => sum + (d.calories || 0), 0))
      : undefined;

  const normalizedMeal = (mealType || 'Lunch').toLowerCase();

  let smallDesc = '';
  let regularDesc = '';
  let largeDesc = '';

  if (normalizedMeal === 'snacks') {
    // ── SNACKS: e.g. Small "1 sandwich", Regular "1 sandwich + tea", Large "2 sandwiches + tea"
    const snackDish =
      dishes.find((d) => d.category === 'Snack' || d.category === 'Main') || dishes[0];
    const bevDish = dishes.find((d) => /tea|chai|coffee|milk/i.test(d.name));
    const bev = bevDish && /coffee/i.test(bevDish.name) ? 'coffee' : 'tea';

    const rawName = cleanDishName(snackDish.name).toLowerCase();
    let singular = rawName;
    let plural = `${rawName}s`;

    if (rawName.includes('sandwich')) {
      singular = 'sandwich';
      plural = 'sandwiches';
    } else if (rawName.includes('cutlet')) {
      singular = 'cutlet';
      plural = 'cutlets';
    } else if (rawName.includes('pakora')) {
      singular = 'bread pakora';
      plural = 'bread pakoras';
    } else if (rawName.includes('puff') || rawName.includes('pattie')) {
      singular = 'puff';
      plural = 'puffs';
    } else if (rawName.includes('puri') || rawName.includes('bhel')) {
      singular = 'plate';
      plural = 'plates';
    } else if (rawName.includes('maggi') || rawName.includes('pasta')) {
      singular = 'bowl maggi';
      plural = 'bowls maggi';
    } else if (rawName.includes('biscuit') || rawName.includes('banana')) {
      singular = 'snack';
      plural = 'snacks';
    }

    smallDesc = `1 ${singular}`;
    regularDesc = `1 ${singular} + ${bev}`;
    largeDesc = `2 ${plural} + ${bev}`;
  } else if (normalizedMeal === 'breakfast') {
    // ── BREAKFAST: e.g. "1 paratha", "2 parathas + tea", "3 parathas + tea"
    const mainDish =
      dishes.find((d) => d.category === 'Bread' || d.category === 'Main') || dishes[0];
    const bevDish = dishes.find((d) => /tea|chai|coffee|milk/i.test(d.name));
    const bev = bevDish && /coffee/i.test(bevDish.name) ? 'coffee' : 'tea';

    const rawMain = cleanDishName(mainDish.name).toLowerCase();

    if (rawMain.includes('paratha')) {
      smallDesc = '1 paratha';
      regularDesc = `2 parathas + ${bev}`;
      largeDesc = `3 parathas + ${bev}`;
    } else if (rawMain.includes('idli')) {
      smallDesc = '2 idlis';
      regularDesc = `3 idlis + sambhar + ${bev}`;
      largeDesc = `4 idlis + sambhar + ${bev}`;
    } else if (rawMain.includes('puri') || rawMain.includes('poori')) {
      smallDesc = '2 puris + bhaji';
      regularDesc = `4 puris + bhaji + ${bev}`;
      largeDesc = `6 puris + bhaji + ${bev}`;
    } else if (rawMain.includes('vada')) {
      smallDesc = '1 vada + sambhar';
      regularDesc = `2 vadas + sambhar + ${bev}`;
      largeDesc = `3 vadas + sambhar + ${bev}`;
    } else if (rawMain.includes('dosa')) {
      smallDesc = '1 plain dosa';
      regularDesc = `1 masala dosa + ${bev}`;
      largeDesc = `2 masala dosas + ${bev}`;
    } else if (rawMain.includes('pav bhaji')) {
      smallDesc = '1 pav + bhaji';
      regularDesc = `2 pav + bhaji + ${bev}`;
      largeDesc = `3 pav + bhaji + ${bev}`;
    } else if (rawMain.includes('pongal') || rawMain.includes('upma') || rawMain.includes('poha')) {
      const item = rawMain.split(' ')[0];
      smallDesc = `1 small bowl ${item}`;
      regularDesc = `1 bowl ${item} + ${bev}`;
      largeDesc = `1 large bowl ${item} + ${bev}`;
    } else {
      smallDesc = `1 plate ${rawMain}`;
      regularDesc = `1 full plate ${rawMain} + ${bev}`;
      largeDesc = `1 extra plate ${rawMain} + ${bev}`;
    }
  } else {
    // ── LUNCH & DINNER: Roti / Rice / Dal / Sabzi generated from menu items
    const breadDish = dishes.find(
      (d) => d.category === 'Bread' || /roti|phulka|chapati|naan|paratha|kulche/i.test(d.name)
    );
    const riceDish = dishes.find(
      (d) => (d.category === 'Main' && /rice|pulao|biryani|khichdi/i.test(d.name)) || /rice|pulao|biryani/i.test(d.name)
    );
    const curryDish = dishes.find(
      (d) => (d.category === 'Curry' && /dal|chhole|sambhar|curry|rajma|kadhi/i.test(d.name)) || /dal|chhole|sambhar|rajma/i.test(d.name)
    );
    const sabziDish = dishes.find(
      (d) => (d.category === 'Curry' && d !== curryDish) || /sabzi|aloo|bhindi|paneer|gobi|matar|baingan/i.test(d.name)
    );
    const sweetDish = dishes.find(
      (d) => d.category === 'Sweet' || /halwa|kheer|rasgulla|jamun|shahi tukda|ice cream|custard/i.test(d.name)
    );

    const curryShort = curryDish ? cleanDishName(curryDish.name) : 'Dal';
    const sabziShort = sabziDish ? cleanDishName(sabziDish.name) : 'Sabzi';
    const riceShort = riceDish ? cleanDishName(riceDish.name) : 'Rice';
    const breadShort = breadDish
      ? cleanDishName(breadDish.name).toLowerCase().includes('naan')
        ? 'Naan'
        : 'Roti'
      : 'Roti';

    smallDesc = `1 ${breadShort} + ${curryShort} + Half ${riceShort}`;
    regularDesc = `2 ${breadShort} + ${sabziShort} + ${riceShort} + ${curryShort}`;
    largeDesc = `3 ${breadShort} + Double ${riceShort} + ${curryShort} + ${sabziShort}${
      sweetDish ? ' + Sweet' : ''
    }`;
  }

  const smallGrams = Math.round(baseGrams * smallMult);
  const regularGrams = Math.round(baseGrams * regularMult);
  const largeGrams = Math.round(baseGrams * largeMult);

  const getCalLabel = (scale: number) => {
    if (!baseCalories) return undefined;
    const approx = Math.round(baseCalories * scale);
    return `approx. ${approx} kcal (estimate)`;
  };

  return [
    {
      portion: 'Small',
      title: 'Small Portion',
      fillPercent: 40,
      desc: smallDesc,
      grams: smallGrams,
      calories: baseCalories ? Math.round(baseCalories * smallMult) : undefined,
      gramsLabel: `~${smallGrams}g per plate`,
      caloriesLabel: getCalLabel(smallMult),
      scale: smallMult,
    },
    {
      portion: 'Regular',
      title: 'Standard Portion',
      fillPercent: 70,
      desc: regularDesc,
      grams: regularGrams,
      calories: baseCalories ? Math.round(baseCalories * regularMult) : undefined,
      gramsLabel: `~${regularGrams}g per plate`,
      caloriesLabel: getCalLabel(regularMult),
      scale: regularMult,
    },
    {
      portion: 'Large',
      title: 'Large Portion',
      fillPercent: 100,
      desc: largeDesc,
      grams: largeGrams,
      calories: baseCalories ? Math.round(baseCalories * largeMult) : undefined,
      gramsLabel: `~${largeGrams}g per plate`,
      caloriesLabel: getCalLabel(largeMult),
      scale: largeMult,
    },
  ];
}
