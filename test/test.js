var assert = require("assert")
var s = require("../s")
describe('s', function () {
    it('prepends intel_syntax and globl and substitutes xmm0', function () {
        assert.deepEqual(
            [
                '.intel_syntax noprefix',
                '.globl _f',
                '_f:',
                'sqrtsd xmm0, xmm0',
                'ret'
            ],
            s([
                'double f(double x)',
                'sqrtsd x, x',
                'ret'
            ])
        )
    })

    it('substitutes named parameter', function () {
        assert.deepEqual(
            [
                '.intel_syntax noprefix',
                '.globl _f',
                '_f:',
                'sqrtsd xmm0, xmm0',
                'ret'
            ],
            s([
                'double f(double y)',
                'sqrtsd y, y',
                'ret'
            ])
        )
    })
})
