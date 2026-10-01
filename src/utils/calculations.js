/**
 * Calculates total estimated budget from category inputs
 */
export function calculateBudgetTotal(categories = {}) {
  const {
    transportasi = 0,
    penginapan = 0,
    tiket = 0,
    makan = 0,
    parkir = 0,
    lainnya = 0,
  } = categories

  return (
    Number(transportasi || 0) +
    Number(penginapan || 0) +
    Number(tiket || 0) +
    Number(makan || 0) +
    Number(parkir || 0) +
    Number(lainnya || 0)
  )
}

/**
 * Calculates budget per person
 */
export function calculatePerPerson(total = 0, personCount = 1) {
  const count = Math.max(1, Number(personCount) || 1)
  return Math.round(Number(total || 0) / count)
}

/**
 * Calculates total spent from expenses array
 */
export function calculateExpenseTotal(expenses = []) {
  return expenses.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
}

/**
 * Calculates remaining budget
 */
export function calculateRemaining(budget = 0, spent = 0) {
  return Math.max(0, Number(budget || 0) - Number(spent || 0))
}

/**
 * Calculates percentage of budget spent (capped at 100 or allowed overflow)
 */
export function calculatePercentage(spent = 0, budget = 0) {
  if (!budget || budget <= 0) return 0
  return Math.round(((Number(spent) || 0) / Number(budget)) * 100)
}
