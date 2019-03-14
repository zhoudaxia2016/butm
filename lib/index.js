const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const { travelDir, evalCode, mkdir } = require('./utils')
const replace = require('./replace')
const {VAR_FILE, TEMP_DIR, TEMP_ROOT} = require('./const')

class Template {
  constructor (dir) {
    this.dir = dir
    this.run()
  }
  async run () {
    let templateDir = await this.getTemplate()
    let vars = require(templateDir + VAR_FILE)
    let opts = await this.getOptions(vars.prompts)
    this.vars = vars
    this.generate(opts, templateDir + TEMP_DIR)
  }
  getOptions (prompts) {
    let p = Object.entries(prompts).map(([name, value]) => {
      return {
        name,
        ...value
      }
    })
    return inquirer.prompt(Object.values(p))
  }
  getTemplate () {
    let templates = fs.readdirSync(TEMP_ROOT)
    return inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Select a template:',
        choices: templates
      }
    ]).then(_ => TEMP_ROOT + _.template + '/')
  }
  generate (opts, templateDir) {
    let tarDir = this.dir
    let { filters, message } = this.vars
    travelDir(templateDir, (abs, rel) => {
      let filterStr = filters[rel]
      if (filterStr && !evalCode(filterStr, 'opts', opts)) return
      let target = path.join(tarDir, rel)
      if (!fs.existsSync(path.dirname(target))) {
        mkdir(path.dirname(target))
      }
      let content = fs.readFileSync(abs)
      content = replace(content, opts)
      fs.writeFileSync(target, content)
    })
    message = message.replace(/{(?<code>[^}]+)}/g, (match, code) => {
      return evalCode(code, 'opts', opts)
    })
    console.log(message)
  }
}

let temp = new Template(process.cwd())
module.exports = Template
