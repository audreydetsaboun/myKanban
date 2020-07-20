const Sortable = require('sortablejs');
const cardModule = require('./card');
const listModule = {
  base_url: null,

  setBaseUrl: (url) => {
    listModule.base_url = url + '/lists';
  },

  showAddModal: () => {
    let modal = document.getElementById('addListModal');
    modal.classList.add('is-active');
  },

  handleAddFormSubmit: async (event) => {
    let data = new FormData(event.target);

    let nbListes = document.querySelectorAll('.panel').length;
    data.set('position', nbListes);

    try {
      let response = await fetch(listModule.base_url, {
        method: 'POST',
        body: data,
      });
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        const list = await response.json();
        let newList = listModule.makeListDOMObject(list.name, list.id);
        listModule.addListToDOM(newList);
      }
    } catch (error) {
      alert('Impossible de créer une liste');
      console.error(error);
    }
  },

  showEditForm: (event) => {
    let listElement = event.target.closest('.panel');
    let formElement = listElement.querySelector('form');

    formElement.querySelector('input[name="name"]').value =
      event.target.textContent;

    event.target.classList.add('is-hidden');
    formElement.classList.remove('is-hidden');
  },

  handleEditListForm: async (event) => {
    event.preventDefault();

    let data = new FormData(event.target);
    let listElement = event.target.closest('.panel');
    const listId = listElement.getAttribute('list-id');

    try {
      let response = await fetch(listModule.base_url + '/' + listId, {
        method: 'PATCH',
        body: data,
      });
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        let list = await response.json();
        listElement.querySelector('h2').textContent = list.name;
      }
    } catch (error) {
      alert('Impossible de modifier la liste');
      console.error(error);
    }

    event.target.classList.add('is-hidden');

    listElement.querySelector('h2').classList.remove('is-hidden');
  },

  makeListDOMObject: (listName, listId) => {
    let template = document.getElementById('template-list');
    let newList = document.importNode(template.content, true);
    newList.querySelector('h2').textContent = listName;
    newList.querySelector('.panel').setAttribute('list-id', listId);

    newList
      .querySelector('.button--add-card')
      .addEventListener('click', cardModule.showAddModal);
    newList
      .querySelector('h2')
      .addEventListener('dblclick', listModule.showEditForm);
    newList
      .querySelector('form')
      .addEventListener('submit', listModule.handleEditListForm);
    const container = newList.querySelector('.panel-block');
    new Sortable(container, {
      group: 'list',
      draggable: '.box',
      onEnd: listModule.handleDropCard,
    });
    return newList;
  },

  handleDropCard: (evt) => {
    const cardElement = evt.item;
    const targetList = evt.to;
    const originList = evt.from;

    let cards = originList.querySelectorAll('.box');
    let listId = originList.closest('.panel').getAttribute('list-id');
    listModule.updateAllCards(cards, listId);

    if (originList !== targetList) {
      cards = targetList.querySelectorAll('.box');
      listId = targetList.closest('.panel').getAttribute('list-id');
      listModule.updateAllCards(cards, listId);
    }
  },

  updateAllCards: (cards, listId) => {
    cards.forEach((card, position) => {
      const cardId = card.getAttribute('card-id');
      let data = new FormData();
      data.set('position', position);
      data.set('list_id', listId);
      console.log(data.get(position));
      console.log(data.get(listId));
      fetch(cardModule.base_url + '/' + cardId, {
        method: 'PATCH',
        body: data,
      });
    });
  },

  addListToDOM: (newList) => {
    let lastColumn = document
      .getElementById('addListButton')
      .closest('.column');
    lastColumn.before(newList);
  },
};

module.exports = listModule;
