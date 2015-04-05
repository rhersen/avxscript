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

    it('substitutes more than one named parameter', function () {
        assert.deepEqual(
            [
                '.intel_syntax noprefix',
                '.globl _f',
                '_f:',
                'sqrtsd xmm0, xmm1',
                'ret'
            ],
            s([
                'double f(double x, double y)',
                'sqrtsd x, y',
                'ret'
            ])
        )
    })

    it('transforms assignment syntax to three-parameter instruction', function () {
        assert.deepEqual(
            [
                '.intel_syntax noprefix',
                '.globl _f',
                '_f:',
                'vdivsd xmm0, xmm1, xmm2',
                'ret'
            ],
            s([
                'double f(double q, double x, double y)',
                'q = vdivsd(x, y)',
                'ret'
            ])
        )
    })

    it('is not too whitespace-sensitive', function () {
        assert.deepEqual(
            [
                '.intel_syntax noprefix',
                '.globl _f',
                '_f:',
                'vdivsd xmm0, xmm1, xmm2',
                'ret'
            ],
            s([
                'double f(double q, double x, double y)',
                'q  =vdivsd(x,y)',
                'ret'
            ])
        )
    })

    it('substitutes named parameter that is prefix of another', function () {
        assert.deepEqual(
            [
                '.intel_syntax noprefix',
                '.globl _f',
                '_f:',
                'sqrtsd xmm0, xmm1',
                'ret'
            ],
            s([
                'double f(double x, double xa)',
                'sqrtsd x, xa',
                'ret'
            ])
        )
    })

    it('handles empty parameter list', function () {
        assert.deepEqual(
            [
                '.intel_syntax noprefix',
                '.globl _f',
                '_f:',
                'ret'
            ],
            s([
                'double f()',
                'ret'
            ])
        )
    })
})
