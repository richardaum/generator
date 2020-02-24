const { step, mqSteps } = require('./docs-helper')

const docs = (steps, mqs) => `
/*
  TYPE SCALE
  Docs: http://tachyons.io/docs/typography/scale/

  Base:
    f = font-size

  Modifiers:
    ${ steps.map((_, idx) => step({ nth: 'size scale' }, idx + 1)).join('\n    ') }

  Media Query Extensions:
    ${mqSteps(mqs)}
*/`

const css = typeScale => {
  const steps = []

  for (let i = 0; i < typeScale.length; i++) {
    steps.push(decl(i + 1, typeScale[i]))
  }

  return steps.join('\n')
}

const variables = (typeScale) => {
  const variables = []
  variables.push(`:root {`)

  for (let i = 0; i < typeScale.length; i++) {
    variables.push(variable(i + 1, typeScale[i]))
  }

  variables.push(`}`)
  return variables.join('\n')
}

const decl = (step, size) => `.f${step} { font-size: var(--font-size-${step}, ${size}rem); }`

const variable = (step, size) => `--font-size-${step}: ${size}rem;`

module.exports = {
  css,
  docs,
  variables,
}
