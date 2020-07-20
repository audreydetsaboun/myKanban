const cardModule = require('./card');
const listModule = require('./list');

var app = {
  // API's URL
  base_url: 'http://localhost:3000',

  // launch at thepage loading
  init: function () {
    listModule.setBaseUrl(app.base_url);
    cardModule.setBaseUrl(app.base_url);

    app.addListenerToActions();

    app.getListsFromAPI();
  },

  // static button and form listeners
  addListenerToActions: () => {
    //buttons
    let addListButton = document.getElementById('addListButton');
    addListButton.addEventListener('click', listModule.showAddModal);

    let closeModalButtons = document.querySelectorAll('.close');
    for (let button of closeModalButtons) {
      button.addEventListener('click', app.hideModals);
    }

    let addListForm = document.querySelector('#addListModal form');
    addListForm.addEventListener('submit', app.handleAddListForm);

    // add cart form
    let addCardForm = document.querySelector('#addCardModal form');
    addCardForm.addEventListener('submit', app.handleAddCardForm);
  },

  hideModals: () => {
    let modals = document.querySelectorAll('.modal');
    for (let modal of modals) {
      modal.classList.remove('is-active');
    }
  },

  // add list form
  handleAddListForm: async (event) => {
    event.preventDefault();
    await listModule.handleAddFormSubmit(event);
    // on ferme les modales !
    app.hideModals();
  },

  handleAddCardForm: async (event) => {
    // prevent page reload
    event.preventDefault();

    await cardModule.handleAddFormSubmit(event);

    // close modals
    app.hideModals();
  },
  /** get data functions */
  getListsFromAPI: async () => {
    try {
      let response = await fetch(app.base_url + '/lists');
      // test
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        let lists = await response.json();
        console.log(lists);
        lists.sort((a, b) =>
          a.position > b.position ? 1 : b.position > a.position ? -1 : 0
        );
        for (let list of lists) {
          let listElement = listModule.makeListDOMObject(list.name, list.id);
          listModule.addListToDOM(listElement);

          for (let card of list.cards) {
            let cardElement = cardModule.makeCardDOMObject(
              card.content,
              card.id,
              card.color
            );
            cardModule.addCardToDOM(cardElement, list.id);
          }
        }
      }
    } catch (error) {
      alert("Impossible de charger les listes depuis l'API.");
      console.error(error);
    }
  },
};

document.addEventListener('DOMContentLoaded', app.init);
