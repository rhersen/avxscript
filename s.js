var _ = require('lodash')

var globl = _.template('.globl _${ name }')
var label = _.template('_${ name }:')
var threeArgs = _.template('${ instruction } ${ destination }, ${ source1 }, ${ source2 }')
var assign = _.template('${ instruction } ${ destination }, ${ source }')

module.exports = function (lines) {
    var declaration = /double (\w+)\((.*)\)/.exec(_.first(lines))
    var name = {name: declaration[1]}
    var parameters = params(declaration[2])

    return [
        '.intel_syntax noprefix',
        globl(name),
        label(name)
    ].concat(_.map(_.rest(lines), substituteParameters))

    function substituteParameters(line) {
        var match = /\s*(\w+)\s*=\s*(\w+)[(\s]*(\w+),\s*(\w+)/.exec(line)
        if (match) {
            line = threeArgs({
                destination: match[1],
                instruction: match[2],
                source1: match[3],
                source2: match[4]
            })
        }
        match = /\s*(\w+)\s*=\s*(\w+)/.exec(line)
        if (match) {
            line = assign({
                instruction: 'movsd',
                destination: match[1],
                source: match[2]
            })
        }
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
    return r
}
