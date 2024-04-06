const fs = require('node:fs');

const styles = ['light'];

styles.forEach((style) => {
    const jsonStyle = require('./styles/' + style + '.json');
    let cssStyle = '';
    for (selector in jsonStyle) {
        if (selector.startsWith('@media')) {
            cssStyle += selector + " {\n";
            for (const styleKey in jsonStyle[selector]) {
                cssStyle += `  ${styleKey} {\n`;
                for (const propertyKey in jsonStyle[selector][styleKey]) {
                    cssStyle += `    ${propertyKey}: ${jsonStyle[selector][styleKey][propertyKey]};\n`;
                }
                cssStyle += `  }\n`;
            }
            cssStyle += `}\n\n`;
        } else {
            const parsedSelector = selector.replace(/([A-Z])/g, '-$1').toLowerCase();
            cssStyle += `${parsedSelector} {\n`;
            for (const propertyKey in jsonStyle[selector]) {
                cssStyle += `  ${propertyKey}: ${jsonStyle[selector][propertyKey]};\n`;
            }
            cssStyle += `}\n\n`;
        }
    }
    fs.writeFileSync('./dist/consent-banner-js/' + process.env.npm_package_version + '/styles/' + style + '.css', cssStyle);
});