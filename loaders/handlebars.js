const Handlebars = require('handlebars');
const logger = require('./logger');

Handlebars.registerHelper( "when",function(operand_1, operator, operand_2, options) {
    const operators = {
        'eq': function(l,r) { return l === r; },
        'noteq': function(l,r) { return l !== r; },
        'gt': function(l,r) { return Number(l) > Number(r); },
        'or': function(l,r) { return l || r; },
        'and': function(l,r) { return l && r; },
        '%': function(l,r) { return (l % r) === 0; }
    }
        , result = operators[operator](operand_1,operand_2);
    logger.info("[loaders.handlebars.registerHelper]", {result});
    if (result) return options.fn(this);
    else return options.inverse(this);
});