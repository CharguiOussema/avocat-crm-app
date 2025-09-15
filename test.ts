/**
 * First-Fit Decreasing (FFD) Algorithm for 1D Cutting Stock
 * 
 * @param {number[]} items - List of item lengths to cut
 * @param {number} stockLength - Length of one stock bar
 * @returns {object[]} bins - Array of bins, each containing placed items
 */
function firstFitDecreasing(items, stockLength) {
  // 1. Sort items in descending order (largest first)
  const sortedItems = [...items].sort((a, b) => b - a);

  const bins = []; // each bin: { items: [], remaining: number }

  // 2. Place each item
  for (const item of sortedItems) {
    let placed = false;

    // Try to fit item in the first bin that has enough space
    for (const bin of bins) {
      if (bin.remaining >= item) {
        bin.items.push(item);
        bin.remaining -= item;
        placed = true;
        break;
      }
    }

    // If no bin found, open a new one
    if (!placed) {
      bins.push({
        items: [item],
        remaining: stockLength - item
      });
    }
  }

  return bins;
}

// Example usage:
const stockLength = 6000; // stock bar length = 6000 mm (6 m)
const items = [2190, 2540, 300, 2000, 1500, 1250, 1250, 2540, 1500];

const result = firstFitDecreasing(items, stockLength);

console.log("Cutting Plan (FFD):");
result.forEach((bin, idx) => {
  console.log(Bar ${idx + 1}: items = [${bin.items.join(", ")}], remaining = ${bin.remaining});
});

console.log(Total bars used: ${result.length});