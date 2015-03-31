var assert = require("assert")
var s = require("../s")
describe('s', function () {
    it('prepends intel_syntax and globl', function () {
        assert.deepEqual(
            [
                '.intel_syntax noprefix',
                '.globl _f',
                '_f:',
                'sqrtsd xmm0, xmm0',
                'ret'
            ],
            s([
                'double f()',
                'sqrtsd xmm0, xmm0',
                'ret'
            ])
        )
    })
})
