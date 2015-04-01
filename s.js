var _ = require('lodash')

var globl = _.template('.globl _${ name }')
var label = _.template('_${ name }:')

module.exports = function (lines) {
    var declaration = /double (\w+)\((.*)\)/.exec(_.first(lines))
    var name = {name: declaration[1]}

    return [
        '.intel_syntax noprefix',
        globl(name),
        label(name)
    ].concat(_.map(_.rest(lines), substitute))

    function substitute(line) {
        _.forEach(parameters(declaration[2]), function (parameter, i) {
            line = line.replace(new RegExp(parameter, 'g'), 'xmm' + i)
        })

        return line
    }
}

function parameters(parameterList) {
    var parameter = /double (\w+)/g
    var r = []
    var match
    while (match = parameter.exec(parameterList)) {
        r.push(match[1])
    }
    return r;
}
