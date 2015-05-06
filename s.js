var _ = require('lodash')

var globl = _.template('.globl _${ name }')
var label = _.template('_${ name }:')
var jumpTo = _.template('${ instruction } ${ label }')
var threeArgs = _.template('${ label }${ instruction } ${ destination }, ${ source1 }, ${ source2 }')
var assign = _.template('${ label }${ instruction } ${ destination }, ${ source }')

module.exports = function (lines) {
    var declaration = /double (\w+)\((.*)\)/.exec(_.first(lines))
    var conditionalJump = /(.*[^\w]|)(\w+)\s*(\W)\s*(\w+)\s*(\?)\s*(\w+)$/;
    var binaryFunction = /(.*[^\w]|)(\w+)\s*=\s*(\w+)[(\s]*(\w+),\s*(\w+)[)\s]*$/;
    var binaryOperator = /(.*[^\w]|)(\w+)\s*=\s*(\w+)\s*(\W)\s*(\w+)$/;
    var compoundAssignment = /(.*[^\w]|)(\w+)\s*(\S)=\s*(\w+)$/;
    var mov = /(.*[^\w]|)(\w+)\s*=\s*(\w+)$/;
    var returnValue = /(.*[^\w]|)return\s+(\w+)\s*$/;

    var name = {name: declaration[1]}
    var parameters = params(declaration[2])
    var instruction = {
        '+': 'addsd',
        '-': 'subsd',
        '×': 'mulsd',
        '÷': 'divsd',
        '∧': 'andpd',
        '∨': 'orpd',
        '⇂': 'minsd',
        '↾': 'maxsd',
        '≡': 'cmpeqsd',
        '<': 'cmpltsd',
        '≤': 'cmplesd',
        '≠': 'cmpneqsd',
        '≥': 'cmpnltsd',
        '>': 'cmpnlesd'
    }

    var jump = {
        '≡': 'je',
        '≠': 'jne',
        '<': 'jb',
        '≤': 'jbe',
        '>': 'ja',
        '≥': 'jae'
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
                label: match[1],
                destination: match[2],
                instruction: match[3],
                source1: match[4],
                source2: match[5]
            })
        }
        match = conditionalJump.exec(line)
        if (match) {
            line = [
                assign({
                    label: match[1],
                    instruction: 'comisd',
                    destination: match[2],
                    source: match[4]
                }),
                jumpTo({
                    instruction: jump[match[3]],
                    label: match[6]
                })]
        }
        match = binaryOperator.exec(line)
        if (match && instruction[match[4]]) {
            line = threeArgs({
                label: match[1],
                destination: match[2],
                source1: match[3],
                instruction: 'v' + instruction[match[4]],
                source2: match[5]
            })
        }
        match = compoundAssignment.exec(line)
        if (match && instruction[match[3]]) {
            line = assign({
                label: match[1],
                instruction: instruction[match[3]],
                destination: match[2],
                source: match[4]
            })
        }
        match = mov.exec(line)
        if (match) {
            line = assign({
                label: match[1],
                instruction: 'movsd',
                destination: match[2],
                source: match[3]
            })
        }
        match = returnValue.exec(line)
        if (match) {
            line = [assign({
                label: match[1],
                instruction: 'movsd',
                destination: 'xmm0',
                source: match[2]
            }), 'ret']
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
