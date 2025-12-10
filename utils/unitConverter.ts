import { Unit } from '../types';

/**
 * Convert between units
 * Returns conversion factor: how many usageUnits = 1 buyingUnit
 */
export const getUnitConversionFactor = (buyingUnit: Unit, usageUnit: Unit): number => {
  // Same unit
  if (buyingUnit === usageUnit) return 1;

  // Weight conversions
  if (buyingUnit === Unit.KG && usageUnit === Unit.GRAM) return 1000; // 1kg = 1000g
  if (buyingUnit === Unit.GRAM && usageUnit === Unit.KG) return 0.001; // 1g = 0.001kg

  // Volume conversions
  if (buyingUnit === Unit.LIT && usageUnit === Unit.ML) return 1000; // 1L = 1000ml
  if (buyingUnit === Unit.ML && usageUnit === Unit.LIT) return 0.001; // 1ml = 0.001L

  // Countable items (cái, quả, hộp) - usually same
  if ([Unit.CAI, Unit.QUA, Unit.HOP].includes(buyingUnit) && 
      [Unit.CAI, Unit.QUA, Unit.HOP].includes(usageUnit)) {
    return 1;
  }

  // Default: no conversion (should not happen)
  console.warn(`No conversion defined from ${buyingUnit} to ${usageUnit}`);
  return 1;
};

/**
 * Convert quantity from buying unit to usage unit
 */
export const convertToUsageUnit = (
  quantity: number,
  buyingUnit: Unit,
  usageUnit: Unit
): number => {
  const factor = getUnitConversionFactor(buyingUnit, usageUnit);
  return quantity * factor;
};

/**
 * Convert quantity from usage unit to buying unit
 */
export const convertToBuyingUnit = (
  quantity: number,
  buyingUnit: Unit,
  usageUnit: Unit
): number => {
  const factor = getUnitConversionFactor(buyingUnit, usageUnit);
  return quantity / factor;
};

