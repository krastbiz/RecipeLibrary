import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './models/Likes';
/**  Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 * - Current Page
 */
const state = {};

/** 
 * SEARCH CONTROLLER 
 */
const openPage = async (query, page = 1) => {
  let skip = (page - 1) * 10;

  // 2) New search object and add to state
  state.search = new Search(query, skip);
  state.search.query = query;

  // 3) Prepare UI for results
  searchView.clearInput();
  searchView.clearResults();
  renderLoader(elements.searchRes);

  // 4) Search for recipes
  try {

    await state.search.getResults();

    // 5) render results on UI
    clearLoader();
    searchView.renderResults(state.search.result);
  } catch (e) {
    alert('Error processing Search!');
    clearLoader();
  }
}

const controlSearch = () => {
  // 1) Get query from view
  const query = searchView.getInput();

  if (query) {
    openPage(query);
  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest(`.btn-inline`);
  console.log(btn);
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
  
    openPage(state.search.query, goToPage);
  }
});

/** 
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
  // Get ID from url
  const id = window.location.hash.replace('#', '');

  if (id) {
    //Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected search item
    if (state.search) searchView.highlightSelecter(id);

    // Create new recipe object
    state.recipe = new Recipe(id);

    // Get recipe data
    try {

      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Render the recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
      

    } catch (error) {
      alert(error);
    }
  }
};
 
 ['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/** 
 * LIST CONTROLLER
 */
const controlList = () => {
  // Create a new list IF there is none yet
  if (!state.list) state.list = new List();

  // Add earch ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
}

//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // Hand;e the delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // Delete from state
    state.list.deleteItem(id);

    // Delete from UI
    listView.deleteItem(id);

    // Handle the count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }

});

/** 
 * LIKE CONTROLLER
 */
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();

  const currentID = state.recipe.id;
  // User has NOT yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    // Toggle the like button
    likesView.toggleLikeBtn(true);

    // Add like to UI list
    likesView.renderLike(newLike);

  // User HAS liked current recipe
  } else {
    // Remove like to the state
    state.likes.deleteLike(currentID);

    // Toggle the like button
    likesView.toggleLikeBtn(false);

    // Remove like to UI list
    likesView.deleteLike(currentID);
  }

  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore likes recipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes();
  
  // Restore likes
  state.likes.readStorage();

  // Toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // Render the existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});


 // Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);  
    }
    
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    // Increase button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    // Add ingredients to shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // Like controller
    controlLike();
  }

});