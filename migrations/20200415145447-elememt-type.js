'use strict';

module.exports = {
  up: async function(db, next) {
    try {
      const elementsCollection = await db.collection('elements');
      const elements = await elementsCollection.find({}).toArray();
      const promises = [];

      for (const element of elements) {
        let newType = '';

        switch (element.type) {
          case 'elm-paragraph':
            newType = 'paragraph';
            break;
          case 'elm-list':
            newType = 'list';
            break;
          case 'elm-image':
            newType = 'image';
            break;
          case 'elm-code':
            newType = 'code';
            break;
          case 'elm-header-1':
            newType = 'header1';
            break;
          case 'elm-header-2':
            newType = 'header2';
            break;
          case 'elm-header-3':
            newType = 'header3';
            break;
          case 'elm-header-4':
            newType = 'header4';
            break;
          case 'elm-header-5':
            newType = 'header5';
            break;
          case 'elm-header-6':
            newType = 'header6';
            break;
          case 'elm-html':
            newType = 'html';
            break;
        }

        if (newType === '') throw new Error('Element type is not recognized: ' + newType);

        promises.push(elementsCollection.update({ _id: element._id }, { $set: { type: newType } }));
      }

      await Promise.all(promises);
    } catch (err) {
      console.error(`An error ocurred. Error Stack: ${err.stack}`);
      return next(err);
    }

    next();
  },

  down: async function(db, next) {
    try {
      const elementsCollection = await db.collection('elements');
      const elements = await elementsCollection.find({}).toArray();
      const promises = [];

      for (const element of elements) {
        let newType = '';

        switch (element.type) {
          case 'paragraph':
            newType = 'elm-paragraph';
            break;
          case 'list':
            newType = 'elm-list';
            break;
          case 'image':
            newType = 'elm-image';
            break;
          case 'code':
            newType = 'elm-code';
            break;
          case 'header1':
            newType = 'elm-header-1';
            break;
          case 'header2':
            newType = 'elm-header-2';
            break;
          case 'header3':
            newType = 'elm-header-3';
            break;
          case 'header4':
            newType = 'elm-header-4';
            break;
          case 'header5':
            newType = 'elm-header-5';
            break;
          case 'header6':
            newType = 'elm-header-6';
            break;
          case 'html':
            newType = 'elm-html';
            break;
        }

        if (newType === '') throw new Error('Element type is not recognized');

        promises.push(elementsCollection.update({ _id: element._id }, { $set: { type: newType } }));
      }

      await Promise.all(promises);
    } catch (err) {
      console.error(`An error ocurred. Error Stack: ${err.stack}`);
      return next(err);
    }

    next();
  }
};
