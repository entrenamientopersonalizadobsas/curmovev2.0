import { NutritionMeals, DailyReadiness } from '../types';

export type NutritionStatusLevel = 'VERDE' | 'AMARILLO' | 'ROJO' | 'SIN_REGISTRO';

export interface NutritionEvaluation {
  level: NutritionStatusLevel;
  totalMeals: number;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgeDot: string;
  description: string;
  mealsSummary: string[];
  missingCrucialMeals: string[];
}

/**
 * Evaluates athlete daily nutrition routine based on the 4 meals:
 * 1) 4 comidas = VERDE
 * 2) 3 comidas = AMARILLO (si incluye Almuerzo y Cena, como Desayuno + Almuerzo + Cena)
 *    Si falta Almuerzo o Cena = ROJO (falta comida principal)
 * 3) 2 comidas = AMARILLO solo si es Almuerzo y Cena
 *    Cualquier otra combinación de 2 comidas (ej. Merienda + Cena o Desayuno + Cena) = ROJO
 * 4) 1 o 0 comidas = ROJO
 */
export function evaluateNutritionMeals(meals?: NutritionMeals): NutritionEvaluation {
  if (!meals) {
    return {
      level: 'SIN_REGISTRO',
      totalMeals: 0,
      label: 'Sin registrar',
      badgeBg: 'bg-[rgba(242,242,242,0.06)]',
      badgeText: 'text-[rgba(242,242,242,0.5)]',
      badgeBorder: 'border-[rgba(242,242,242,0.12)]',
      badgeDot: 'bg-[#71717a]',
      description: 'Sin reporte de comidas para esta fecha.',
      mealsSummary: [],
      missingCrucialMeals: ['Almuerzo', 'Cena']
    };
  }

  const { breakfast, lunch, snack, dinner } = meals;
  const count = [breakfast, lunch, snack, dinner].filter(Boolean).length;
  const activeMealNames: string[] = [];
  const missingMeals: string[] = [];

  if (breakfast) activeMealNames.push('Desayuno'); else missingMeals.push('Desayuno');
  if (lunch) activeMealNames.push('Almuerzo'); else missingMeals.push('Almuerzo');
  if (snack) activeMealNames.push('Merienda'); else missingMeals.push('Merienda');
  if (dinner) activeMealNames.push('Cena'); else missingMeals.push('Cena');

  // Case 0: No meals reported
  if (count === 0) {
    return {
      level: 'ROJO',
      totalMeals: 0,
      label: 'Rojo (0/4)',
      badgeBg: 'bg-[rgba(239,68,68,0.12)]',
      badgeText: 'text-[#ef4444]',
      badgeBorder: 'border-[rgba(239,68,68,0.28)]',
      badgeDot: 'bg-[#ef4444]',
      description: 'No se registraron comidas en el día.',
      mealsSummary: activeMealNames,
      missingCrucialMeals: ['Desayuno', 'Almuerzo', 'Merienda', 'Cena']
    };
  }

  // Case 1: 4 meals completed -> VERDE
  if (count === 4) {
    return {
      level: 'VERDE',
      totalMeals: 4,
      label: 'Verde (4/4 completas)',
      badgeBg: 'bg-[rgba(34,197,94,0.14)]',
      badgeText: 'text-[#22c55e]',
      badgeBorder: 'border-[rgba(34,197,94,0.3)]',
      badgeDot: 'bg-[#22c55e]',
      description: 'Excelente: cumplió las 4 comidas del día (Desayuno, Almuerzo, Merienda y Cena).',
      mealsSummary: activeMealNames,
      missingCrucialMeals: []
    };
  }

  // Case 2: 3 meals completed
  // "3 comidas amarillo (desayuno almuerzo y cena ), teniendo en cuenta las comidas más importantes"
  if (count === 3) {
    if (lunch && dinner) {
      return {
        level: 'AMARILLO',
        totalMeals: 3,
        label: 'Amarillo (3/4 comidas)',
        badgeBg: 'bg-[rgba(234,179,8,0.14)]',
        badgeText: 'text-[#eab308]',
        badgeBorder: 'border-[rgba(234,179,8,0.3)]',
        badgeDot: 'bg-[#eab308]',
        description: breakfast
          ? '3 comidas (Desayuno, Almuerzo y Cena). Cubrió las comidas prioritarias del día.'
          : '3 comidas (Almuerzo, Merienda y Cena). Cubrió Almuerzo y Cena.',
        mealsSummary: activeMealNames,
        missingCrucialMeals: missingMeals
      };
    } else {
      // 3 meals but missing either lunch or dinner
      const missingCrucial = !lunch ? 'Almuerzo' : 'Cena';
      return {
        level: 'ROJO',
        totalMeals: 3,
        label: 'Rojo (3/4 sin principal)',
        badgeBg: 'bg-[rgba(239,68,68,0.12)]',
        badgeText: 'text-[#ef4444]',
        badgeBorder: 'border-[rgba(239,68,68,0.28)]',
        badgeDot: 'bg-[#ef4444]',
        description: `Faltó el ${missingCrucial} (comida principal esencial del día).`,
        mealsSummary: activeMealNames,
        missingCrucialMeals: [missingCrucial]
      };
    }
  }

  // Case 3: 2 meals completed
  // "2 comidas amarillo (almuerzo y cena) y ROJO solo merienda y cena o solo desayuno y cena y así, teniendo en cuenta las comidas mas importantes del dia"
  if (count === 2) {
    if (lunch && dinner) {
      return {
        level: 'AMARILLO',
        totalMeals: 2,
        label: 'Amarillo (2/4 Alm + Cena)',
        badgeBg: 'bg-[rgba(234,179,8,0.14)]',
        badgeText: 'text-[#eab308]',
        badgeBorder: 'border-[rgba(234,179,8,0.3)]',
        badgeDot: 'bg-[#eab308]',
        description: '2 comidas realizadas (Almuerzo y Cena). Cubrió las 2 comidas clave.',
        mealsSummary: activeMealNames,
        missingCrucialMeals: missingMeals
      };
    } else {
      return {
        level: 'ROJO',
        totalMeals: 2,
        label: 'Rojo (2/4 insuficiente)',
        badgeBg: 'bg-[rgba(239,68,68,0.12)]',
        badgeText: 'text-[#ef4444]',
        badgeBorder: 'border-[rgba(239,68,68,0.28)]',
        badgeDot: 'bg-[#ef4444]',
        description: `Solo realizó ${activeMealNames.join(' y ')}. Faltaron comidas primordiales (${!lunch ? 'Almuerzo' : 'Cena'}).`,
        mealsSummary: activeMealNames,
        missingCrucialMeals: missingMeals
      };
    }
  }

  // Case 4: 1 meal completed -> ROJO
  return {
    level: 'ROJO',
    totalMeals: 1,
    label: 'Rojo (1/4 deficiente)',
    badgeBg: 'bg-[rgba(239,68,68,0.12)]',
    badgeText: 'text-[#ef4444]',
    badgeBorder: 'border-[rgba(239,68,68,0.28)]',
    badgeDot: 'bg-[#ef4444]',
    description: `Solo realizó 1 comida (${activeMealNames[0] || 'Incompleta'}). Aporte nutricional crítico.`,
    mealsSummary: activeMealNames,
    missingCrucialMeals: missingMeals
  };
}

export interface NutritionPeriodSummary {
  totalLoggedDays: number;
  daysVerde: number;
  daysAmarillo: number;
  daysRojo: number;
  daysSinRegistro: number;
  adherenceRate: number; // % Verde + Amarillo
  strictVerdeRate: number; // % Verde
  avgMealsPerDay: string;
  dominantStatus: NutritionStatusLevel;
  breakfastCount: number;
  lunchCount: number;
  snackCount: number;
  dinnerCount: number;
}

export function calculateNutritionPeriodSummary(logs: DailyReadiness[]): NutritionPeriodSummary {
  let daysVerde = 0;
  let daysAmarillo = 0;
  let daysRojo = 0;
  let daysSinRegistro = 0;
  let totalMealsSum = 0;
  let breakfastCount = 0;
  let lunchCount = 0;
  let snackCount = 0;
  let dinnerCount = 0;
  let validLogsCount = 0;

  logs.forEach((log) => {
    if (!log.nutritionMeals) {
      daysSinRegistro++;
      return;
    }

    const evalResult = evaluateNutritionMeals(log.nutritionMeals);
    validLogsCount++;
    totalMealsSum += evalResult.totalMeals;

    if (log.nutritionMeals.breakfast) breakfastCount++;
    if (log.nutritionMeals.lunch) lunchCount++;
    if (log.nutritionMeals.snack) snackCount++;
    if (log.nutritionMeals.dinner) dinnerCount++;

    if (evalResult.level === 'VERDE') daysVerde++;
    else if (evalResult.level === 'AMARILLO') daysAmarillo++;
    else if (evalResult.level === 'ROJO') daysRojo++;
  });

  const totalLoggedDays = validLogsCount;
  const adherenceRate = totalLoggedDays > 0 ? Math.round(((daysVerde + daysAmarillo) / totalLoggedDays) * 100) : 0;
  const strictVerdeRate = totalLoggedDays > 0 ? Math.round((daysVerde / totalLoggedDays) * 100) : 0;
  const avgMealsPerDay = totalLoggedDays > 0 ? (totalMealsSum / totalLoggedDays).toFixed(1) : '0.0';

  let dominantStatus: NutritionStatusLevel = 'SIN_REGISTRO';
  if (totalLoggedDays > 0) {
    if (daysVerde >= totalLoggedDays * 0.6) {
      dominantStatus = 'VERDE';
    } else if (daysVerde + daysAmarillo >= totalLoggedDays * 0.5) {
      dominantStatus = 'AMARILLO';
    } else {
      dominantStatus = 'ROJO';
    }
  }

  return {
    totalLoggedDays,
    daysVerde,
    daysAmarillo,
    daysRojo,
    daysSinRegistro,
    adherenceRate,
    strictVerdeRate,
    avgMealsPerDay,
    dominantStatus,
    breakfastCount,
    lunchCount,
    snackCount,
    dinnerCount
  };
}
