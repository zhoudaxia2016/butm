const fs = require('fs')
const path = require('path')

const travelDir = (absDir, callback, relDir = '') => {
  fs.readdirSync(absDir).forEach(function(file) {
    let abs = path.join(absDir, file)
    let rel = path.join(relDir, file)
    if (fs.statSync(abs).isDirectory()) {
      travelDir(abs, callback, rel)
    } else {
      callback(abs, rel)
    }
  })
}

const evalCode = (code, scope, opts) => {
  for (let key in opts) {
    let reg = new RegExp(key, 'g')
    code = code.replace(reg, `${scope}.${key}`)
  }
  return eval(code)
}

const mkdir = dir => {
  if (!fs.existsSync(dir)) {
    let parentDir = path.resolve(dir, '..')
    if (!fs.existsSync(parentDir)) {
      mkdir(parentDir)
    }
    fs.mkdirSync(dir)
  }
}

module.exports = {
  travelDir,
  evalCode,
  mkdir
}
