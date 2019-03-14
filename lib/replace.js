const ifRegH = '#if_eq\\s+(\\S+)\\s+([^}]+)'
const ifRegF = '\\/if_eq'
const condRegH = '#(\\S+)'
const condRegF = '\\/\\1'
const rmWs ='(?:\\n[ \\t]*)?'
const codeReg = '([\\s\\S]*?)'
const ifCondRegTemp = rmWs + '{{$h}}' + codeReg + '(?:{{#else}}' + rmWs + codeReg + ')?' + rmWs + '{{$f}}'

const ifReg = new RegExp(ifCondRegTemp.replace('$h', ifRegH).replace('$f', ifRegF), 'g')
const condReg = new RegExp(ifCondRegTemp.replace('$h', condRegH).replace('$f', condRegF), 'g')
const nameReg = /{{([^}]+)}}/g
const vueTempReg = /{%{([^}]+)}%}/g

module.exports = function (content, opts) {
  content = content.toString()
  /* replace {{#if_eq key value}}...{{/if_eq}} */
  content = content.replace(ifReg, (match, key, value, code1, code2) => {
    code2 = code2 ? code2 : ''
    return opts[key] === value ? code1 : code2
  })
  /* replace {{#key}}...{{/key}} */
  content = content.replace(condReg, (match, key, code) => {
    return opts[key] ? code : ''
  })
  /* replace {{key}} */
  content = content.replace(nameReg, (match, capture) => {
    return opts[capture]
  })
  /* 防止vue模板冲突 */
  content = content.replace(vueTempReg, '{{$1}}')
  /* 删除文件头多出空行 */
  content = content.replace(/^\n/, '')
  return content
}
