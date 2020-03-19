import axios from 'axios';
import {key} from '../config';

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = (await axios(`https://api.spoonacular.com/recipes/${this.id}/information?apiKey=${key}`)).data;
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
    const units = [...unitsShort, 'kg', 'g'];

    const newIngredients = this.ingredients.map( el => {
      // 1. Uniform units
      let ingredient = el.original.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });

      // 2. Remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

      // 3. Parse ingredients into count, unit and ingredient
      const arrIng = ingredient.split(' ');
      const unitIndex = arrIng.findIndex(el2 => {
        units.includes(el2);
      });

      let objIng;
      if (unitIndex > -1) {
        // There is a unit
        // Ex. 4 1/2 cups, arrCount will be [4, 1/2]
        // Ex. 4 cups, arrCount is [4]
        const arrCount = arrIng.slice(0, unitIndex);
        let count;
        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace('-', '+'));
        } else {
          count = eval(arrIng.slice(0, unitIndex).join('+'));
        }

        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(' ')
        }

      } else if (parseInt(arrIng[0], 10)) {
        //There is no unit, but 1st element is number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: '',
          ingredient: arrIng.slice(1).join(' ')
        }
      } else if (unitIndex === -1) {
        // There is no unit and NOT number
        objIng = {
          count: 1,
          unit: '',
          ingredient,
        }
      }
      
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