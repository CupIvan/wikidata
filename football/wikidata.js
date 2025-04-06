function _PP(P, a)
{
	if (!a) return ''
	if (a.qualifiers) a = a.qualifiers
	if (a.claims) a = a.claims
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
	if (a.datatype == 'quantity')
		return parseInt(a.datavalue.value.amount)
	if (a.datatype == 'time')
		return _t(a.datavalue.value.time)
	if (a.datatype == 'wikibase-item')
		return a.datavalue.value.id
	try { if (a.entity.type == 'uri') return a.entity.value.replace(/.+\/Q/, 'Q') } catch(e) {}
	return ''
}
function _t(x)
{
	let t = new Date(x.replace(/^\+/, ''))
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
		if (a[k='labels'])       for (i in a[k]) if (!['ru','en','fr'].includes(i)) delete a[k][i]
		if (a[k='descriptions']) for (i in a[k]) if (!['ru','en','fr'].includes(i)) delete a[k][i]
		if (a[k='sitelinks'])    for (i in a[k]) if (!['ruwiki','enwiki','frwiki'].includes(i)) delete a[k][i]
		delete a.aliases
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

async function wikidata_search_pv(P, v)
{
	if (v[0] == 'Q') v = 'wd:'+v; else v = '"'+v+'"'
	const WQS = 'SELECT ?entity WHERE { ?entity wdt:'+P+' '+v+'}'
	return fetch('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(WQS))
		.then(_=>_.json()).then(_=>_.results.bindings)
}

function _wd(Q) { return !Q?'':'<sup><a href="https://www.wikidata.org/wiki/'+Q+'">[wd]</a></sup>'; }
function _label(a, lang='ru')
{
	if (!a.labels) return ''
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
