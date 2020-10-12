'use strict';

const faker = require('faker'),
      fetch = require('node-fetch'),
      imgAPI = 'https://source.unsplash.com/collection/514990/';
faker.locale = "ru";

async function getImgURL() {
  try {
    const response = await fetch(imgAPI);
    if (response.status == 200) {
      const imgURL = response.url;
      return imgURL;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

async function getData() {
  try {
    let data = { 
      cards: [],
      vote: []
    };
    for (let i = 0; i < 10; i++) {
      let imgURL = await getImgURL();
      let unCollapsedImgURL = imgURL.replace('w=1080', 'w=680');
      let collapsedImgURL = imgURL.replace('w=1080', 'w=200');
      data.cards.push({
        id: i,
        collapsed_photo: collapsedImgURL,
        uncollapsed_photo: unCollapsedImgURL,
        description: faker.lorem.paragraph(),
        vote: 0
      });
      console.error('Generated ' + (i + 1) + ' data');
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

(async () => {
  let data = await getData();
  console.log(JSON.stringify(data));
})();