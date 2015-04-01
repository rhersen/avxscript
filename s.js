var _ = require('lodash');

var globl = _.template('.globl _${ name }');
var label = _.template('_${ name }:');

module.exports = function (lines) {
    var declaration = /double (\w+)\(double (\w+)\)/.exec(_.first(lines));
    var options = {name: declaration[1]};

    return [
        '.intel_syntax noprefix',
        globl(options),
        label(options)
    ].concat(_.map(_.rest(lines), substitute))

    function substitute(line) {
        return line.replace(new RegExp(declaration[2], 'g'), 'xmm0')
    }
}
