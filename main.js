var fs = require('fs')
var s = require('./s')
var pathToFile = process.argv[2]

var bufferString, bufferStringSplit

function readFile() {
    bufferString = fs.readFileSync(pathToFile, {encoding: 'utf8'})
    return bufferString.split('\n')
}

bufferStringSplit = s(readFile())
bufferStringSplit.forEach(function (line) {
    console.log(line)
})