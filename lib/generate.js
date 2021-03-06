const camel = require('camelcase')
const kebab = require('kebab-case')
const isBlank = require('is-blank')

const manifest = require('./manifest')
const color = require('./color')
const mqify = require('mqify')

const generators = {
  borderWidths: require('./border-widths'),
  borderRadius: require('./border-radius'),
  typeScale: require('./type-scale'),
  spacing: require('./spacing'),
  widths: require('./widths'),
  maxWidths: require('./max-widths'),
  heights: require('./heights'),
  typography: require('./typography'),
  opacity: require('./opacity'),
  lineHeight: require('./line-height'),
  tables: require('./tables'),
  nested: require('./nested'),
}

const cssOnly = (generator, config, mqs, fullConfig) => `${ generator.css(config, fullConfig) }`

const cssOnlyWithDocs = (generator, config, mqs, fullConfig) => `${generator.docs(config, mqs)}`

const cssOnlyWithVariable = (generator, config) =>
  `${generator.variables ? generator.variables(config) : ""}`

module.exports = (config, mediaQueries) => {
  const colors = color(config.palette || config.colors)

  const skipModules = (config.skipModules || []).map(n => camel(n))

  const px = Object.keys(manifest)
    .filter(filterSkipped.bind(null, skipModules))
    .map(name => {
      const module = manifest[name]

      let css = null
      let variables = ''
      let docs = ''

      if (module.colors) {
        css = colors[name]()
      } else if (generators.hasOwnProperty(name)) {
        const generator = generators[name]
        docs = cssOnlyWithDocs(generator, config[name], config.customMedia, config)
        variables = cssOnlyWithVariable(generator, config[name])
        css = cssOnly(generator, config[name], config.customMedia, config)
      } else {
        css = requireify(name)
      }

      if (!module.mq) {
        return { name, css }
      }

      return mqify(css, mediaQueries).then(css => ({
        name, 
        css: `${docs}\n${variables}\n${css}`,
      }))
    })

  return Promise.all(px).then(reduceModules)
}

const reduceModules = modules => {
  return modules.reduce((prev, curr) => {
    prev[camel(curr.name)] = curr.css
    return prev
  }, {})
}

const filterSkipped = (skipModules, name) => {
  if (isBlank(skipModules)) {
    return true
  } else {
    return !skipModules.includes(camel(name))
  }
}

const requireify = name => {
  const kebabed = kebab(name)
  return require(`../partials/_${kebabed}.css`)
}
