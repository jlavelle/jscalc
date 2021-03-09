const Either = (() => {
  const Left = x => ({ isLeft: true, value: x })
  const Right = x => ({ isLeft: false, value: x })

  const match = pattern => e => e.isLeft ? pattern.Left(e.value) : pattern.Right(e.value)

  const bind = f => match({
    Left: e => Left(e),
    Right: a => f(a)
  })

  const chain = x => f => bind(f)(x)

  const pure = Right

  const map = f => match({
    Left: e => Left(e),
    Right: x => Right(f(x))
  })

  return {
    Left, Right, match, bind, chain, pure, map
  }
})()

const Maybe = (() => {
  const Nothing = { isJust: false }
  const Just = x => ({ isJust: true, value: x })

  const match = pattern => x => x.isJust ? pattern.Just(x.value) : pattern.Nothing()

  const maybe = n => f => match({
    Nothing: () => n,
    Just: x => f(x)
  })

  return { Nothing, Just, match, maybe }

})()

const String = (() => {
  const append = s1 => s2 => s1.concat(s2)
  const empty = ""
  return { append, empty }
})()

const takeWhile = f => xs => {
  let res = []
  for (let i = 0; i < xs.length; i++) {
    if (f(xs[i])) {
      res.push(xs[i])
    } else {
      return res
    }
  }
  return res
}

const last = xs => xs[xs.length - 1]

const lastBy = pred => xs => xs.reduce((acc, x) => pred(x) ? Maybe.Just(x) : acc, Maybe.Nothing)

const any = f => xs => xs.reduce((acc, x) => f(x) || acc, false)

const compose = (...fs) => x => fs.reduceRight((acc, f) => f(acc), x)

const fold = monoid => xs => xs.reduce((acc, x) => monoid.append(acc)(x), monoid.empty)

const tail = xs => xs.slice(0, xs.length - 1)

const panic = message => { throw new Error(message) }

export default { Either, Maybe, String, takeWhile, panic, any, last, lastBy, compose, fold, tail }
