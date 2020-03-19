import axios from 'axios';
import {key} from '../config';

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = (await axios(`https://api.spoonacular.com/recipes/${this.id}/information?apiKey=${key}`)).data;
      console.log(res);
      this.title = res.title;
      this.author = res.creditsText;
      this.img = res.image;
      this.url = res.sourceUrl;
      this.ingredients = res.extendedIngredients;
      this.cookTime = res.cookingMinutes;
      this.servings = res.servings;

    } catch (error) {
      console.log(error);
    }
  }

  parseIngredients() {
    const unitsLong = ['tablespoon', 'tablespoons', 'onces', 'ounce', 'teaspoon', 'teaspoons', 'cups', 'pounds'];
    const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];

    const newIngredients = this.ingredients.map( el => {
      
      // 1. Shorten utins
      let formattedUnit = el.unit.toLowerCase();
      unitsLong.forEach((unit, i) => {
        if (formattedUnit === unit) {
          formattedUnit = formattedUnit.replace(unit, unitsShort[i]);
        }
      });

      let objIng = {
        count: el.amount,
        unit: formattedUnit,
        ingredient: el.name
      };
      
      return objIng;
    });

    this.ingredients = newIngredients; 
  }

  updateServings (type) {
    // Servings
    const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
    
    // Ingredients
    this.ingredients.forEach(ing => {
      ing.count *= (newServings / this.servings);
    });

    this.servings = newServings;

  }
}