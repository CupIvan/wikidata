function _PP(P, a)
{
	if (!a) return ''
	if (a.length) a = a[0]
	if (a.qualifiers) a = a.qualifiers
	if (a.claims) a = a.claims
	if ((''+P)[0] == 'P') P = P.substring(1)
	if (!a['P'+P]) return ''
	a = a['P'+P]
	let res = []
	for (let i=0; i<a.length; i++)
		res[i] = _value(a[i])
	return res
}
function _P(P, a)
{
	return _PP(P, a)[0]
}
function _value(a)
{
	if (!a) return ''
	if (a.mainsnak) a = a.mainsnak
	if (a.datatype == 'string')
		return a.datavalue.value
	if (a.datatype == 'quantity')
		return parseInt(a.datavalue.value.amount)
	if (a.datatype == 'time')
		return a.datavalue ? _t(a.datavalue.value.time) : ''
	if (a.datatype == 'wikibase-item')
		return a.datavalue ? a.datavalue.value.id : undefined
	try { if (a.entity.type == 'uri') return a.entity.value.replace(/.+\/Q/, 'Q') } catch(e) {}
	return ''
}
function _t(x)
{
	x = x.replace('-00-00', '-01-01')
	let t = new Date(x.replace(/^\+/, ''))
	if (!t) return ''
	return t.getFullYear()+'-'+_z(t.getMonth()+1)+'-'+_z(t.getDate())
}
function _z(x) { return x<10?'0'+x:x }



function _rnd(from, to)
{
	if (!to) { to = from; from = 0; }
	return Math.floor(Math.random() * (to - from) + from)
}
async function wikidata(Q)
{
	if (!Q) return {}
	let st = localStorage.getItem(Q)
	let a; try { a = JSON.parse(st) } catch(e){}
	if (!a) a = {}
	else
	if ((new Date().getTime() - a.timestamp) < _rnd(1,30)*24*3600*1000) // в кеше от 1 до 30 дней
		return a

	a = await wikidata_search(Q)
	a.timestamp = new Date().getTime()
	{ // почистим ненужные языки, чтобы уменьшить объект
		let k, i
		if (a[k='labels'])       for (i in a[k]) if (!['ru','en','fr','mul'].includes(i)) delete a[k][i]
		if (a[k='descriptions']) for (i in a[k]) if (!['ru','en','fr'].includes(i)) delete a[k][i]
		if (a[k='sitelinks'])    for (i in a[k]) if (!['ruwiki','enwiki','frwiki'].includes(i)) delete a[k][i]
		if (a[k='aliases'])      for (i in a[k]) if (!['ru','en'].includes(i)) delete a[k][i]
	}
	try {
		localStorage.setItem(Q, JSON.stringify(a))
	} catch(e) {
		if (e.name != 'QuotaExceededError') throw e
		// пробуем удалить старые записи
		let a = []
		for (let i = 0; i < localStorage.length; i++)
		{
			const Q = localStorage.key(i)
			const _ = JSON.parse(localStorage.getItem(Q)) || {}
			a.push({Q, timestamp: _.timestamp||0})
		}
		a.sort((x,y)=>x.timestamp-y.timestamp)
		const deleted = []
		for (let i = 0; i < 20 && i < a.length; i++) // удаляем 20 старых записей
		{
			localStorage.removeItem(a[i].Q)
			deleted.push(a[i].Q)
		}
		console.log('localStorage: REMOVE '+deleted.join(', '))
	}
	return a
}

async function wikidata_search(Q)
{
	return fetch('https://www.wikidata.org/wiki/Special:EntityData/'+Q+'.json')
		.then(_=>_.json()).then(_=>_.entities[Q])
}

async function wikidata_search_pv(a)
{
	let P, WQS = 'SELECT ?entity WHERE {'
	for (P in a) {
		let v = a[P]
		if (v[0] == 'Q') v = 'wd:'+v; else v = '"'+v+'"'
		WQS += '?entity '+P.replace(/(P\d+)/g, 'wdt:$1')+' '+v+'. '
	}
	WQS += '}'
	return fetch('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(WQS))
		.then(_=>_.json()).then(_=>_.results.bindings)
}

function _wd(Q) { if (typeof(Q)=='object')Q=Q.id; return !Q?'':'<sup><a href="https://www.wikidata.org/wiki/'+Q+'">[wd]</a></sup>'; }
function _w(a)  { let url = _sitelink(a); return !url?'':'<sup><a href="'+url+'">[w]</a></sup>'; }
function _label(a, lang='ru')
{
	if (!a) return ''
	if (!a.labels) return ''
	if (!a.labels[lang]) lang = 'mul'
	if (!a.labels[lang]) lang = 'en'
	return a.labels[lang].value||''
}
function _sitelink(a)
{
	if (!a.sitelinks) return ''
	let x = 'ruwiki'
	if (!a.sitelinks[x]) x = 'enwiki'
	if (!a.sitelinks[x]) x = 'frwiki'
	return a.sitelinks[x] ? a.sitelinks[x].url : ''
}
function _aliases(a, lang='ru')
{
	if (!a.aliases) return ''
	if (!a.aliases[lang]) lang = 'en'
	if (!a.aliases[lang]) lang = 'fr'
	let res = []
	if (a.aliases[lang])
	for (let i=0; i<a.aliases[lang].length; i++)
		res.push(a.aliases[lang][i].value)
	return res
}
