window.addEventListener('load', _=>onHashChanged(document.body.restore = document.body.innerHTML))
window.addEventListener('hashchange', onHashChanged)

function _header()
{
	return '<small><a href="#">Главная</a>'
		+' | <a href="#clear" onclick="'
		+'localStorage.clear(); console.log(\'localStorage: CLEAR\'); return false'
		+'">очистить localStorage ('+localStorage.length+')</a></small>'
}
function _error(e){ console.error(e); return _header()+'<br>Ошибка :-( '+e; }

function onHashChanged()
{
	const hash = document.location.hash
	let re
	if (re = /person=(Q\d+)/.exec(hash))  return loadPerson(re[1])
	loadMain()
}

function loadMain() { document.body.innerHTML = document.body.restore }

function Section()
{
	const el = document.createElement('section')
	this.replace = function(parent) {
		if (!parent) return false
		parent.innerHTML = ''
		parent.append(el)
	}
	this.append = function(st) {
		let div = document.createElement('div')
		if (typeof(st) == 'function') st = st()
		if (typeof(st) == 'string') div.innerHTML = st
		if (typeof(st) == 'object' && st.then)
			st.then(_ => { div.innerHTML = _ })
		el.appendChild(div)
		return st
	}
	return this
}

function _append(x)
{
	const section = document.createElement('section')
	if (typeof(x) == 'function') x = x()
	if (typeof(x) == 'string') section.innerHTML = x
	else section.appendChild(x)
	document.body.appendChild(section)
}
function Observer(fnc)
{
	this.then = (obj2st) => { return {then: async _=> {
		const handler = async (a) => {
			let res = obj2st(a)
			if (res.then) return _(await res)
			return _(res)
		}
		fnc(handler)
	} } }
	return this
}

function sendToQuickStatements(st)
{
	let url = 'https://quickstatements.toolforge.org/#v1='+st
	url = url.replace(/\t/g, '|')
	url = url.replace(/\n/g, '||')
	document.location = url
}
