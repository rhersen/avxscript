var _ = require('lodash')

var globl = _.template('.globl _${ name }')
var label = _.template('_${ name }:')
var threeArgs = _.template('${ instruction } ${ destination }, ${ source1 }, ${ source2 }')
var assign = _.template('${ instruction } ${ destination }, ${ source }')

module.exports = function (lines) {
    var declaration = /double (\w+)\((.*)\)/.exec(_.first(lines))
    var binaryFunction = /\s*(\w+)\s*=\s*(\w+)[(\s]*(\w+),\s*(\w+)[)\s]*$/;
    var binaryOperator = /\s*(\w+)\s*=\s*(\w+)\s*(\W)\s*(\w+)$/;
    var compoundAssignment = /\s*(\w+)\s*(\S)=\s*(\w+)$/;
    var mov = /\s*(\w+)\s*=\s*(\w+)$/;
    var returnValue = /\s*return\s+(\w+)\s*$/;

    var name = {name: declaration[1]}
    var parameters = params(declaration[2])
    var instruction = {
        '+': 'addsd',
        '-': 'subsd',
        '×': 'mulsd',
        '÷': 'divsd',
        '∧': 'andpd',
        '∨': 'orpd',
        '≡': 'cmpeqsd',
        '<': 'cmpltsd',
        '≤': 'cmplesd',
        '≠': 'cmpneqsd',
        '≥': 'cmpnltsd',
        '>': 'cmpnlesd'
    }

    return [
        '.intel_syntax noprefix',
        globl(name),
        label(name)
    ].concat(
        _(lines)
            .rest()
            .map(substituteOperators)
            .flatten()
            .map(substituteParameters)
            .value())

    function substituteOperators(line) {
        var match
        match = /\s*(\w+)\s*=/.exec(line)
        if (match && !_.contains(parameters, match[1])) {
            parameters.push(match[1])
        }
        match = binaryFunction.exec(line)
        if (match) {
            line = threeArgs({
                destination: match[1],
                instruction: match[2],
                source1: match[3],
                source2: match[4]
            })
        }
        match = binaryOperator.exec(line)
        if (match && instruction[match[3]]) {
            line = threeArgs({
                destination: match[1],
                source1: match[2],
                instruction: 'v' + instruction[match[3]],
                source2: match[4]
            })
        }
        match = compoundAssignment.exec(line)
        if (match && instruction[match[2]]) {
            line = assign({
                instruction: instruction[match[2]],
                destination: match[1],
                source: match[3]
            })
        }
        match = mov.exec(line)
        if (match) {
            line = assign({
                instruction: 'movsd',
                destination: match[1],
                source: match[2]
            })
        }
        match = returnValue.exec(line)
        if (match) {
            line = [
                assign({
                    instruction: 'movsd',
                    destination: 'xmm0',
                    source: match[1]
                }),
                'ret']
        }
        return line;
    }

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
    return r
}
