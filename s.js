var _ = require('lodash');

var globl = _.template('.globl _${ name }');
var label = _.template('_${ name }:');

module.exports = function (lines) {
    var declaration = /double (\w+)\((.*)\)/.exec(_.first(lines));
    var parameterList = declaration[2];
    var parameterListMatch = /double (\w+)/.exec(parameterList);
    var options = {name: declaration[1]};
    var firstParameter = parameterListMatch && parameterListMatch[1];

    return [
        '.intel_syntax noprefix',
        globl(options),
        label(options)
    ].concat(_.map(_.rest(lines), substitute))

    function substitute(line) {
        if (firstParameter) {
            return line.replace(new RegExp(firstParameter, 'g'), 'xmm0')
        } else {
            return line
        }
    }
}
