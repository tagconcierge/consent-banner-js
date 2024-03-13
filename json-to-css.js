const fs = require('node:fs');

const styles = ['light'];

styles.forEach((style) => {
    const jsonStyle = require('./styles/' + style + '.json');
    let cssStyle = '';
    for (selector in jsonStyle) {
        const parsedSelector = selector.replace(/([A-Z])/g, '-$1');
        cssStyle += parsedSelector + " {\n";
        for (prop in jsonStyle[selector]) {
            cssStyle += "  " + prop + ": " + jsonStyle[selector][prop] + ";\n";
        }
        cssStyle += "} \n\n";
    }
    fs.writeFileSync('./dist/consent-banner-js/' + process.env.npm_package_version + '/styles/' + style + '.css', cssStyle);
});


