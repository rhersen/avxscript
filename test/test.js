var _ = require("lodash")
var assert = require("assert")
var s = require("../s")
describe('s', function () {
    it('prepends intel_syntax and globl and substitutes xmm0', function () {
        assert.deepEqual(
            assembler('sqrtsd xmm0, xmm0'),
            s([
                'double f(double x)',
                'sqrtsd x, x',
                'ret'
            ])
        )
    })

    it('substitutes named parameter', function () {
        assert.deepEqual(
            assembler('sqrtsd xmm0, xmm0'),
            s([
                'double f(double y)',
                'sqrtsd y, y',
                'ret'
            ])
        )
    })

    it('substitutes more than one named parameter', function () {
        assert.deepEqual(
            assembler('sqrtsd xmm0, xmm1'),
            s([
                'double f(double x, double y)',
                'sqrtsd x, y',
                'ret'
            ])
        )
    })

    it('transforms assignment syntax to three-parameter instruction', function () {
        assert.deepEqual(
            assembler('vdivsd xmm0, xmm1, xmm2'),
            s([
                'double f(double q, double x, double y)',
                'q = vdivsd(x, y)',
                'ret'
            ])
        )
    })

    it('transforms simple assignment to mov instruction', function () {
        assert.deepEqual(
            assembler('movsd xmm0, xmm1'),
            s([
                'double f(double target, double source)',
                'target = source',
                'ret'
            ])
        )
    })

    it('transforms plus-assignment to addsd instruction', function () {
        assert.deepEqual(
            assembler('addsd xmm0, xmm1'),
            s([
                'double f(double q, double x)',
                'q += x',
                'ret'
            ])
        )
    })

    it('transforms minus-assignment to subsd instruction', function () {
        assert.deepEqual(
            assembler('subsd xmm0, xmm1'),
            s([
                'double f(double q, double x)',
                'q -= x',
                'ret'
            ])
        )
    })

    it('transforms return to mov xmm0 followed by ret', function () {
        assert.deepEqual(
            assembler(
                'vsubsd xmm2, xmm0, xmm1',
                'movsd xmm0, xmm2'
            ),
            s([
                'double f(double q, double x)',
                'y = q - x',
                'return y'
            ])
        )
    })

    it('transforms minus to vsubsd instruction', function () {
        assert.deepEqual(
            assembler('vsubsd xmm0, xmm1, xmm2'),
            s([
                'double f(double diff, double x, double y)',
                'diff = x - y',
                'ret'
            ])
        )
    })

    it('does not transform partial line', function () {
        assert.deepEqual(
            assembler('xmm0 = xmm1 - xmm2)'),
            s([
                'double f(double q, double x, double y)',
                'q = x - y)',
                'ret'
            ])
        )
    })

    it('does not remove leading label', function () {
        assert.deepEqual(
            assembler('loop: vsubsd xmm0, xmm1, xmm2'),
            s([
                'double f(double q, double x, double y)',
                'loop: q = x - y',
                'ret'
            ])
        )
    })

    it('does not transform unrecognized operator', function () {
        assert.deepEqual(
            assembler('xmm0 = xmm1 ! xmm2'),
            s([
                'double f(double q, double x, double y)',
                'q = x ! y',
                'ret'
            ])
        )
    })

    it('is not too whitespace-sensitive', function () {
        assert.deepEqual(
            assembler('vdivsd xmm0, xmm1, xmm2'),
            s([
                'double f(double q, double x, double y)',
                'q  =vdivsd(x,y)',
                'ret'
            ])
        )
    })

    it('substitutes named parameter that is prefix of another', function () {
        assert.deepEqual(
            assembler('sqrtsd xmm0, xmm1'),
            s([
                'double f(double x, double xa)',
                'sqrtsd x, xa',
                'ret'
            ])
        )
    })

    it('regards undeclared variable as local variable', function () {
        assert.deepEqual(
            assembler('movsd xmm1, xmm0'),
            s([
                'double f(double x)',
                'xa = x',
                'ret'
            ])
        )
    })

    it('only declares a local variable once', function () {
        assert.deepEqual(
            assembler(
                'movsd xmm1, xmm0',
                'movsd xmm1, xmm0',
                'movsd xmm2, xmm0'
            ),
            s([
                'double f(double x)',
                'a = x',
                'a = x',
                'b = x',
                'ret'
            ])
        )
    })

    it('handles empty parameter list', function () {
        assert.deepEqual(
            assembler(),
            s([
                'double f()',
                'ret'
            ])
        )
    })

    function assembler() {
        return ['.intel_syntax noprefix', '.globl _f', '_f:'].concat(_.toArray(arguments), 'ret')
    }
})
