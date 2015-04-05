var fs = require('fs')
var s = require('./s')
var pathToFile = process.argv[2]
var outFile = pathToFile.substr(0, pathToFile.length - 2)

var bufferString, bufferStringSplit

function readFile() {
    bufferString = fs.readFileSync(pathToFile, {encoding: 'utf8'})
    return bufferString.split('\n')
}

bufferStringSplit = s(readFile())

fs.writeFileSync(outFile, bufferStringSplit.join('\n'))
