const fs = require('node:fs');

const css = fs.readFileSync(`./styles/light.css`).toString().replace(/(?:\r\n|\r|\n)/g, '');
const app = fs.readFileSync(`./src/app.js`);

const bundle = `
var style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode('${css}'));
document.head.appendChild(style);
${app}
`;

fs.writeFileSync('./dist/bundle.js', bundle);