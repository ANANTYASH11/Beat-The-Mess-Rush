import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { university, getMenuForDayAndMeal } from '@/config/university';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messId = searchParams.get('messId') || university.messes[0].id;

    // Check if custom menu exists in Setting
    const customSetting = await prisma.setting.findUnique({
      where: { key: `custom_menu_${messId}` },
    });

    let items: any[] = [];

    if (customSetting?.value) {
      try {
        items = JSON.parse(customSetting.value);
      } catch {
        items = [];
      }
    }

    // If no custom overrides yet, construct list from university.weeklyMenu
    if (items.length === 0) {
      let counter = 1;
      DAYS.forEach((dayName, dayIdx) => {
        MEALS.forEach((mealName) => {
          const dishes = getMenuForDayAndMeal(dayName, mealName);
          dishes.forEach((d) => {
            items.push({
              id: `menu-${dayIdx}-${mealName.toLowerCase()}-${counter++}`,
              messId,
              dayOfWeek: dayIdx,
              mealType: mealName,
              name: d.name,
              category: d.category,
              avgGramsPerPlate: d.avgGramsPerPlate || 150,
            });
          });
        });
      });
    }

    return NextResponse.json({ items, messes: university.messes });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching menu';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messId = body.messId || university.messes[0].id;

    // Fetch existing
    const customSetting = await prisma.setting.findUnique({
      where: { key: `custom_menu_${messId}` },
    });

    let existingItems: any[] = [];
    if (customSetting?.value) {
      try {
        existingItems = JSON.parse(customSetting.value);
      } catch {
        existingItems = [];
      }
    }

    // If empty, initialize from base
    if (existingItems.length === 0) {
      let counter = 1;
      DAYS.forEach((dayName, dayIdx) => {
        MEALS.forEach((mealName) => {
          const dishes = getMenuForDayAndMeal(dayName, mealName);
          dishes.forEach((d) => {
            existingItems.push({
              id: `menu-${dayIdx}-${mealName.toLowerCase()}-${counter++}`,
              messId,
              dayOfWeek: dayIdx,
              mealType: mealName,
              name: d.name,
              category: d.category,
              avgGramsPerPlate: d.avgGramsPerPlate || 150,
            });
          });
        });
      });
    }

    // Support CSV Batch Import
    if (Array.isArray(body.items)) {
      let imported = 0;
      body.items.forEach((item: any) => {
        let dayIdx = typeof item.day === 'number' ? item.day : -1;
        if (typeof item.day === 'string') {
          const cleaned = item.day.trim().toLowerCase();
          dayIdx = DAYS.findIndex((d) => d.toLowerCase() === cleaned);
          if (dayIdx === -1 && !isNaN(Number(cleaned))) dayIdx = Number(cleaned);
        }
        if (dayIdx < 0 || dayIdx > 6) return;

        const meal = item.meal ? item.meal.trim() : 'Lunch';
        const dishName = item.dish ? item.dish.trim() : item.name?.trim();
        const category = item.category ? item.category.trim() : 'Main';
        const grams = Number(item.avgGramsPerPlate) || 150;

        if (!dishName) return;

        const newDish = {
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          messId,
          dayOfWeek: dayIdx,
          mealType: meal,
          name: dishName,
          category,
          avgGramsPerPlate: grams,
        };

        // Replace if exact match exists, else push
        const matchIdx = existingItems.findIndex(
          (i) => i.dayOfWeek === dayIdx && i.mealType.toLowerCase() === meal.toLowerCase() && i.name.toLowerCase() === dishName.toLowerCase()
        );
        if (matchIdx !== -1) {
          existingItems[matchIdx] = newDish;
        } else {
          existingItems.push(newDish);
        }
        imported++;
      });

      await prisma.setting.upsert({
        where: { key: `custom_menu_${messId}` },
        update: { value: JSON.stringify(existingItems) },
        create: { key: `custom_menu_${messId}`, value: JSON.stringify(existingItems) },
      });

      return NextResponse.json({ success: true, processed: imported });
    }

    // Single Dish Add
    const { dayOfWeek, mealType, name, category, avgGramsPerPlate } = body;
    if (!name || dayOfWeek === undefined || !mealType) {
      return NextResponse.json({ error: 'Missing required dish fields' }, { status: 400 });
    }

    const newItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      messId,
      dayOfWeek: Number(dayOfWeek),
      mealType,
      name: name.trim(),
      category: category || 'Main',
      avgGramsPerPlate: Number(avgGramsPerPlate) || 150,
    };

    existingItems.push(newItem);

    await prisma.setting.upsert({
      where: { key: `custom_menu_${messId}` },
      update: { value: JSON.stringify(existingItems) },
      create: { key: `custom_menu_${messId}`, value: JSON.stringify(existingItems) },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error modifying menu';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, avgGramsPerPlate, name, category, messId = university.messes[0].id } = body;

    const customSetting = await prisma.setting.findUnique({
      where: { key: `custom_menu_${messId}` },
    });

    let items: any[] = [];
    if (customSetting?.value) {
      try {
        items = JSON.parse(customSetting.value);
      } catch {
        items = [];
      }
    }

    if (items.length === 0) {
      let counter = 1;
      DAYS.forEach((dayName, dayIdx) => {
        MEALS.forEach((mealName) => {
          const dishes = getMenuForDayAndMeal(dayName, mealName);
          dishes.forEach((d) => {
            items.push({
              id: `menu-${dayIdx}-${mealName.toLowerCase()}-${counter++}`,
              messId,
              dayOfWeek: dayIdx,
              mealType: mealName,
              name: d.name,
              category: d.category,
              avgGramsPerPlate: d.avgGramsPerPlate || 150,
            });
          });
        });
      });
    }

    const targetIdx = items.findIndex((i) => i.id === id);
    if (targetIdx !== -1) {
      if (avgGramsPerPlate !== undefined) items[targetIdx].avgGramsPerPlate = Number(avgGramsPerPlate);
      if (name) items[targetIdx].name = name.trim();
      if (category) items[targetIdx].category = category.trim();

      await prisma.setting.upsert({
        where: { key: `custom_menu_${messId}` },
        update: { value: JSON.stringify(items) },
        create: { key: `custom_menu_${messId}`, value: JSON.stringify(items) },
      });

      return NextResponse.json({ success: true, item: items[targetIdx] });
    }

    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating dish';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const messId = searchParams.get('messId') || university.messes[0].id;

    if (!id) return NextResponse.json({ error: 'Missing dish id' }, { status: 400 });

    const customSetting = await prisma.setting.findUnique({
      where: { key: `custom_menu_${messId}` },
    });

    let items: any[] = [];
    if (customSetting?.value) {
      try {
        items = JSON.parse(customSetting.value);
      } catch {
        items = [];
      }
    }

    if (items.length === 0) {
      let counter = 1;
      DAYS.forEach((dayName, dayIdx) => {
        MEALS.forEach((mealName) => {
          const dishes = getMenuForDayAndMeal(dayName, mealName);
          dishes.forEach((d) => {
            items.push({
              id: `menu-${dayIdx}-${mealName.toLowerCase()}-${counter++}`,
              messId,
              dayOfWeek: dayIdx,
              mealType: mealName,
              name: d.name,
              category: d.category,
              avgGramsPerPlate: d.avgGramsPerPlate || 150,
            });
          });
        });
      });
    }

    items = items.filter((i) => i.id !== id);

    await prisma.setting.upsert({
      where: { key: `custom_menu_${messId}` },
      update: { value: JSON.stringify(items) },
      create: { key: `custom_menu_${messId}`, value: JSON.stringify(items) },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting dish';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
