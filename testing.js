// const _ = require('lodash');
// const dongles = require('./dongles');

// let entry = _.find(dongles, {'name': 'alecbaldwin'});
// if (!entry) {
//    entry = _.sample(dongles);
// }
// console.log('entry', entry);
// // let dongle = JSON.parse(entry).dongle;
// let dongle = entry.dongle;
// console.log('dongle', dongle);

const _ = require('lodash');
const cute = require('./cute');
console.log('SEARCHING FOR', process.env.STRING);
let url;

const foundData = cute.filter(function(data){
    return data.tags && data.tags.includes(process.env.STRING);
});

// console.log('foundData', foundData);

let data;
if (foundData.length) {
    data = _.sample(foundData);
} else {
    // random, since we didn't find what we were looking for
    data = _.sample(cute);
}

url = data.url;

console.log('url', url);

