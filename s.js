var _ = require('lodash')

var globl = _.template('.globl _${ name }')
var label = _.template('_${ name }:')

module.exports = function (lines) {
    var declaration = /double (\w+)\((.*)\)/.exec(_.first(lines))
    var name = {name: declaration[1]}
    var parameters = params(declaration[2]);

    return [
        '.intel_syntax noprefix',
        globl(name),
        label(name)
    ].concat(_.map(_.rest(lines), substituteParameters))

    function substituteParameters(line) {
        return _.reduce(parameters, substituteParameter, line)
    }

    function substituteParameter(s, p, i) {
        return s.replace(new RegExp('\\b' + p + '\\b', 'g'), 'xmm' + i)
    }
}

function params(parameterList) {
    var parameter = /double (\w+)/g
    var r = []
    var match
    while (match = parameter.exec(parameterList)) r.push(match[1])
    return r;
}
