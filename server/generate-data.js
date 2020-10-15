'use strict';

const faker = require('faker'),
      fetch = require('node-fetch'),
      imgAPI = 'https://source.unsplash.com/collection/514990/',
      dataCount = 150;
faker.locale = "ru";

async function getImgURL(i) {
  try {
    let response = await fetch(imgAPI + i);
    if (response.status == 200) {
      let imgURL = response.url;
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
      cards: []
    };
    for (let i = 0; i < dataCount; i++) {
      let imgURL = await getImgURL(i);
      let uncollapsedImgURL = imgURL.replace('w=1080', 'w=680');
      let collapsedImgURL = imgURL.replace('w=1080', 'w=100');
      data.cards.push({
        id: i,
        collapsedPhoto: collapsedImgURL,
        uncollapsedPhoto: uncollapsedImgURL,
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