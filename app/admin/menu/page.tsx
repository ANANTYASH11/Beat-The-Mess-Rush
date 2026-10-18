'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Utensils,
  Plus,
  Trash2,
  Upload,
  Download,
  Save,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { university } from '@/config/university';
import { TactileButton } from '@/components/ui/TactileButton';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const CATEGORIES = ['Main', 'Dal', 'Sabzi', 'Bread', 'Rice', 'Curd', 'Snack', 'Beverage', 'Sweet'];

export default function AdminMenuPage() {
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [selectedMeal, setSelectedMeal] = useState('Lunch');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [csvText, setCsvText] = useState('');
  const [showCsvModal, setShowCsvModal] = useState(false);

  // New dish form
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('Main');
  const [newDishGrams, setNewDishGrams] = useState(150);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/menu?messId=${university.messes[0].id}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const currentDishes = items.filter(
    (i) => i.dayOfWeek === selectedDay && i.mealType === selectedMeal
  );

  const handleUpdateGrams = async (id: string, grams: number) => {
    playDhabaSound('flip');
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, avgGramsPerPlate: grams }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, avgGramsPerPlate: grams } : item))
        );
        setStatusMsg('Portion grammage updated!');
        setTimeout(() => setStatusMsg(''), 2000);
      }
    } catch {
      setStatusMsg('Failed to update portion');
    }
  };

  const handleDeleteDish = async (id: string) => {
    playDhabaSound('press');
    try {
      const res = await fetch(`/api/admin/menu?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setStatusMsg('Dish removed from menu');
        setTimeout(() => setStatusMsg(''), 2000);
      }
    } catch {
      setStatusMsg('Failed to delete dish');
    }
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;
    playDhabaSound('press');

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messId: university.messes[0].id,
          dayOfWeek: selectedDay,
          mealType: selectedMeal,
          name: newDishName.trim(),
          category: newDishCategory,
          avgGramsPerPlate: newDishGrams,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setItems((prev) => [...prev, data.item]);
        }
        setNewDishName('');
        setStatusMsg(`Added ${newDishName} to ${DAYS[selectedDay]} ${selectedMeal}`);
        setTimeout(() => setStatusMsg(''), 2500);
      }
    } catch {
      setStatusMsg('Error adding dish');
    }
  };

  const handleCsvImport = async () => {
    if (!csvText.trim()) return;
    playDhabaSound('press');

    try {
      // Parse CSV: lines with day,meal,dish,category,[avgGramsPerPlate]
      const lines = csvText.split('\n');
      const parsedItems: any[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || i === 0 && line.toLowerCase().startsWith('day')) continue; // skip header
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 3) {
          parsedItems.push({
            day: parts[0],
            meal: parts[1],
            dish: parts[2],
            category: parts[3] || 'Main',
            avgGramsPerPlate: parts[4] ? Number(parts[4]) : 150,
          });
        }
      }

      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messId: university.messes[0].id,
          items: parsedItems,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setStatusMsg(`Imported ${result.processed} menu dishes from CSV!`);
        setShowCsvModal(false);
        setCsvText('');
        fetchMenu();
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch {
      setStatusMsg('Error parsing or uploading CSV');
    }
  };

  return (
    <div className="w-full space-y-8 pb-16 max-w-6xl mx-auto">
      {/* 1. ADMIN SUBNAV */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-4 shadow-brutal-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-3 py-1.5 font-mono text-xs font-bold rounded-lg border-2 border-[#14110F] bg-[#FAF5E8] text-[#14110F] hover:bg-[#EAE1CA]"
          >
            CONTROLS
          </Link>
          <Link
            href="/admin/menu"
            className="px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#14110F] bg-[#14110F] text-[#FAF5E8]"
          >
            WEEKLY MENU
          </Link>
          <Link
            href="/admin/data"
            className="px-3 py-1.5 font-mono text-xs font-bold rounded-lg border-2 border-[#14110F] bg-[#FAF5E8] text-[#14110F] hover:bg-[#EAE1CA]"
          >
            DATA &amp; EXPORT
          </Link>
          <Link
            href="/admin/pilot"
            className="px-3 py-1.5 font-mono text-xs font-bold rounded-lg border-2 border-[#14110F] bg-[#FAF5E8] text-[#14110F] hover:bg-[#EAE1CA]"
          >
            PILOT TRIAL
          </Link>
        </div>
        <div className="font-mono text-xs font-bold text-[#5C554F]">
          MESS: <span className="font-black text-[#14110F]">{university.messes[0].name.toUpperCase()}</span>
        </div>
      </div>

      {/* 2. HEADER */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase bg-[#F28C1B] text-[#14110F] px-2.5 py-0.5 rounded border border-[#14110F]">
              CAMPUS MENU MASTER
            </span>
            <span className="font-serif italic text-xs text-[#5C554F]">
              साप्ताहिक भोजनालय सूची
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-[#14110F] mt-1">
            WEEKLY MENU &amp; PORTION GRAMS
          </h1>
          <p className="font-serif text-sm text-[#5C554F] mt-1">
            Configure {university.messes[0].name} schedule (Day × Meal × Dishes). Kitchen forecasts and waste logs automatically pull from this real menu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/menu-template.csv"
            download
            className="px-3.5 py-2 bg-[#FAF5E8] border-2 border-[#14110F] rounded-xl font-mono text-xs font-bold text-[#14110F] hover:bg-[#EAE1CA] flex items-center gap-1.5 shadow-brutal-xs"
          >
            <Download className="w-4 h-4" />
            CSV TEMPLATE
          </a>
          <button
            type="button"
            onClick={() => setShowCsvModal(true)}
            className="px-3.5 py-2 bg-[#F28C1B] border-2 border-[#14110F] rounded-xl font-mono text-xs font-black text-[#14110F] hover:bg-[#e07f15] flex items-center gap-1.5 shadow-brutal-xs"
          >
            <Upload className="w-4 h-4" />
            IMPORT CSV
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-[#2F6B3A]/15 border-2 border-[#2F6B3A] rounded-xl font-mono text-xs font-black text-[#2F6B3A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 3. DAY SELECTOR & MEAL TABS */}
      <div className="space-y-4">
        {/* Days */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {DAYS.map((dayName, idx) => (
            <button
              key={dayName}
              type="button"
              onClick={() => {
                setSelectedDay(idx);
                playDhabaSound('flip');
              }}
              className={`p-2.5 rounded-xl border-2 border-[#14110F] font-mono text-xs font-black uppercase text-center transition-all ${
                selectedDay === idx
                  ? 'bg-[#14110F] text-[#FAF5E8] shadow-brutal-sm -translate-y-0.5'
                  : 'bg-[#FAF5E8] text-[#14110F] hover:bg-[#EAE1CA]'
              }`}
            >
              {dayName}
            </button>
          ))}
        </div>

        {/* Meals */}
        <div className="flex border-b-2 border-[#14110F] gap-2 overflow-x-auto pb-1">
          {MEALS.map((meal) => (
            <button
              key={meal}
              type="button"
              onClick={() => {
                setSelectedMeal(meal);
                playDhabaSound('flip');
              }}
              className={`px-4 py-2 font-display text-xl uppercase tracking-wider border-2 border-b-0 border-[#14110F] rounded-t-xl transition-all ${
                selectedMeal === meal
                  ? 'bg-[#F28C1B] text-[#14110F] font-black'
                  : 'bg-[#FAF5E8] text-[#5C554F] hover:text-[#14110F]'
              }`}
            >
              {meal}
            </button>
          ))}
        </div>
      </div>

      {/* 4. DISHES TABLE */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-lg space-y-6">
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#14110F]/20">
          <div>
            <h2 className="font-display text-2xl font-black uppercase text-[#14110F]">
              {DAYS[selectedDay]} • {selectedMeal.toUpperCase()} DISHES ({currentDishes.length})
            </h2>
            <span className="font-serif italic text-xs text-[#5C554F]">
              Click grams to adjust standard portion size calibrated for hostel prep
            </span>
          </div>
        </div>

        {currentDishes.length === 0 ? (
          <div className="p-8 text-center bg-[#F4ECD8] border-2 border-dashed border-[#14110F]/30 rounded-xl font-mono text-xs text-[#5C554F]">
            No dishes listed for {DAYS[selectedDay]} {selectedMeal}. Add one below or import from CSV template!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-[#14110F] text-[#5C554F] uppercase text-[10px]">
                  <th className="py-2 px-3">Dish Name</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Avg Grams / Plate</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14110F]/15">
                {currentDishes.map((dish) => (
                  <tr key={dish.id} className="hover:bg-[#EFE7D0]/60 transition-colors">
                    <td className="py-3 px-3 font-black text-sm text-[#14110F]">
                      {dish.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-[#14110F]/10 rounded border border-[#14110F]/20 font-bold text-[11px]">
                        {dish.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="20"
                          max="500"
                          step="10"
                          defaultValue={dish.avgGramsPerPlate || 150}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val && val !== dish.avgGramsPerPlate) {
                              handleUpdateGrams(dish.id, val);
                            }
                          }}
                          className="w-20 px-2 py-1 bg-white border-2 border-[#14110F] rounded font-mono font-bold text-xs"
                        />
                        <span className="text-[#5C554F] font-bold">grams</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteDish(dish.id)}
                        className="p-1.5 text-[#D7312B] hover:bg-[#D7312B]/10 rounded border border-transparent hover:border-[#D7312B] transition-colors"
                        title="Remove dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. ADD INLINE DISH FORM */}
        <form onSubmit={handleAddDish} className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl space-y-3">
          <div className="font-mono text-xs font-black uppercase text-[#14110F] flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>ADD NEW DISH TO {DAYS[selectedDay].toUpperCase()} {selectedMeal.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="e.g. Kadhi Pakoda"
              value={newDishName}
              onChange={(e) => setNewDishName(e.target.value)}
              className="px-3 py-2 bg-white border-2 border-[#14110F] rounded-lg font-mono text-xs font-bold placeholder:text-[#8E857C]"
            />
            <select
              value={newDishCategory}
              onChange={(e) => setNewDishCategory(e.target.value)}
              className="px-3 py-2 bg-white border-2 border-[#14110F] rounded-lg font-mono text-xs font-bold"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="20"
                max="500"
                step="10"
                value={newDishGrams}
                onChange={(e) => setNewDishGrams(Number(e.target.value))}
                className="w-24 px-3 py-2 bg-white border-2 border-[#14110F] rounded-lg font-mono text-xs font-bold"
              />
              <span className="font-mono text-xs text-[#5C554F]">g/plate</span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#14110F] text-[#FAF5E8] hover:bg-[#F28C1B] hover:text-[#14110F] border-2 border-[#14110F] rounded-lg font-mono text-xs font-black uppercase transition-colors"
            >
              + ADD DISH
            </button>
          </div>
        </form>
      </div>

      {/* 6. CSV IMPORT MODAL */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-[#14110F]/70 flex items-center justify-center p-4">
          <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 max-w-xl w-full shadow-brutal-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b-2 border-[#14110F]/20">
              <h3 className="font-display text-2xl font-black uppercase text-[#14110F]">
                IMPORT CSV MENU
              </h3>
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="font-mono text-xs font-black text-[#14110F] hover:text-[#D7312B]"
              >
                ✕ CLOSE
              </button>
            </div>

            <p className="font-serif text-xs text-[#5C554F]">
              Paste CSV text below or upload matching columns: <code>day,meal,dish,category,avgGramsPerPlate</code>. Example file is at <code>/public/menu-template.csv</code>.
            </p>

            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Monday,Lunch,Chole Masala,Curry,160&#10;Monday,Lunch,Bhature,Bread,120&#10;Monday,Lunch,Jeera Rice,Rice,150"
              className="w-full p-3 bg-white border-2 border-[#14110F] rounded-xl font-mono text-xs text-[#14110F] leading-relaxed"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 border-2 border-[#14110F] rounded-lg font-mono text-xs font-bold bg-[#FAF5E8] text-[#14110F]"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleCsvImport}
                className="px-4 py-2 bg-[#2F6B3A] text-white border-2 border-[#14110F] rounded-lg font-mono text-xs font-black uppercase hover:bg-[#25562e]"
              >
                IMPORT NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
