import axios from 'axios';
import {key} from '../config';

// ******* Uncomment this line below if API is not working *******
const data = require('../../../data.json');

export default class Search {
  constructor(query, skip = 0) {
    this.query = query;
    this.skip = skip
  }

  async getResults() {  
    try {
      //this.result = (await axios(`https://api.spoonacular.com/recipes/search?apiKey=${key}&query=${this.query}&offset=${this.skip}`)).data;

      // ******* Uncomment this line below if API is not working *******
      this.result = data;
    } catch (error) {
      alert(error)
    }
  }
}