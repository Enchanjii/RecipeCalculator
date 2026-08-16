// TODO: Insert your USDA FoodData Central API Key below
const API_KEY = 'KeQpWeNtyN4Q2evtWGi4stwhhMoHdYIwMcQCw9rW';

/**
 * Milestone 2: Fetch single ingredient data from USDA API
 */
async function fetchIngredientData(ingredient) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(ingredient)}&pageSize=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    
    const data = await response.json();
    return data.foods && data.foods.length > 0 ? data.foods[0] : null;
  } catch (error) {
    console.error(`Error fetching "${ingredient}":`, error);
    return null;
  }
}

/**
 * Milestone 3 & 4: Extract nutrients, calculate total, and update DOM
 */
async function analyzeRecipe() {
  const inputArea = document.getElementById('recipe-input');
  const btnText = document.getElementById('btn-text');
  
  // Extract lines and filter empty strings
  const lines = inputArea.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    alert('Please enter at least one ingredient.');
    return;
  }

  // Update button visual state
  btnText.textContent = 'Calculating...';

  // Execute all fetches concurrently
  const promises = lines.map(ingredient => fetchIngredientData(ingredient));
  const results = await Promise.all(promises);

  let totals = { calories: 0, fat: 0, carbs: 0, protein: 0 };

  // Helper to extract nutrient value by ID
  const getNutrient = (nutrients, id) => {
    const match = nutrients.find(n => n.nutrientId === id);
    return match ? match.value : 0;
  };

  results.forEach(food => {
    if (food && food.foodNutrients) {
      totals.calories += getNutrient(food.foodNutrients, 1008); // Calories
      totals.protein += getNutrient(food.foodNutrients, 1003);  // Protein
      totals.fat += getNutrient(food.foodNutrients, 1004);      // Fat
      totals.carbs += getNutrient(food.foodNutrients, 1005);    // Carbs
    }
  });

  // Render totals to DOM
  document.getElementById('total-calories').textContent = Math.round(totals.calories);
  document.getElementById('total-fat').textContent = totals.fat.toFixed(1);
  document.getElementById('total-carbs').textContent = totals.carbs.toFixed(1);
  document.getElementById('total-protein').textContent = totals.protein.toFixed(1);

  // Reset button state
  btnText.textContent = 'Analyze Recipe';
}