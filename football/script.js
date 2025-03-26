window.addEventListener('load', _=>onHashChanged(document.body.restore=document.body.innerHTML))
window.addEventListener('hashchange', onHashChanged)

function _header()
{
	return '<small><a href="#">Главная</a> | <a href="" onclick="localStorage.clear()">очистить localStorage</a></small>'
}
function _start() { document.body.innerHTML = _header()+'<br>Загрузка данных...' }
function _error(e){ return _header()+'<br>Ошибка :-( '+e }

function onHashChanged()
{
	const hash = document.location.hash
	let re
	if (re = /tournament=(Q\d+)/.exec(hash))  return loadTournament(re[1])
	if (re = /competition=(Q\d+)/.exec(hash)) return loadCompetition(re[1])
	loadMain()
}

function loadMain() { document.body.innerHTML = document.body.restore }


async function loadTournament(Q)
{
	_start()

	let st = '', _
try {
	let a = await wikidata(Q)

	st += _header()
	st += '<h1><a href="'+_sitelink(a)+'">'+_label(a)+'</a>'+_wd(Q)+'</h1>'
	_ = await getCompetitions(a.claims['P527']) // состоит из
	st += '<ol>'
	for (let i=0; i<_.length; i++)
		st += '<li><a href="#?competition='+_[i].id+'">'+_label(_[i])+'</a>'
	st += '</ol>'
} catch(e){ st = _error(e) }
	document.body.innerHTML = st
}
async function getCompetitions(a)
{
	let res = []
	if (!a) return res
	for (let i=0; i<a.length; i++)
	{
		let _ = await wikidata(a[i].mainsnak.datavalue.value.id)
		_.label = _label(_)
		res.push(_)
	}
	// сортируем по названию
	res.sort((a,b)=>a.label.localeCompare(b.label))
	return res
}

async function loadCompetition(Q)
{
	_start()

	let st = '', _
try {
	let a = await wikidata(Q)

	st += _header()
	st += '<h1><a href="'+_sitelink(a)+'">'+_label(a)+'</a>'+_wd(Q)+'</h1>'

	st += '<h3>Турнирная таблица</h3>'
	_ = await getTeams(a.claims['P1923']) // команды-участницы
	st += '<table class="t">'
	st += '<tr><th>Поз<th>Команда<th>И<th>В<th>Н<th>П<th>МЗ<th>МП<th>РМ<th>О'
	for (let i=0,w,d,g,s; i<_.length; i++)
	{
		st += '<tr>'
		st += '<td>'+_P(1352, _[i])
		st += '<td><a href="#team='+_[i].entity.id+'">'+_label(_[i].entity)+'</a>'+_wd(_[i].entity.id)
		st += '<td>'+_P(1350, _[i]) // total
		st += '<td>'+(w=_P(1355, _[i])) // wins
		st += '<td>'+(d=_P(1357, _[i])) // draws
		st += '<td>'+_P(1356, _[i]) // fails
		st += '<td>'+(g=_P(1351, _[i])) // goals
		st += '<td>'+(s=_P(1359, _[i])) // skips
		st += '<td>'+(g-s) // delta
		st += '<td>'+(w*3+d) // points
	}
	st += '</table>'

	st += '<h3>Сыгранные матчи</h3>'
	_ = await getMatches(a.claims['P527']) // состоит из
	st += '<table class="t">'
	st += '<tr><th>Дата<th>Команды<th>Счёт'
	for (let i=0; i<_.length; i++)
	{
		st += '<tr>'
		st += '<td>'+_P(585, _[i])
		st += '<td>'+_[i].labels.ru.value
		st += '<td>'+_[i].score
	}
	st += '</table>'
} catch(e){ st = _error(e) }
	document.body.innerHTML = st
}
async function getTeams(a)
{
	let res = []
	if (!a) return res
	for (let i=0; i<a.length; i++)
	{
		a[i].entity = await wikidata(a[i].mainsnak.datavalue.value.id)
		let x = 'ru'
		res.push(a[i])
	}
	// сортируем по названию
	res.sort((a,b)=>{
		a.entity.labels.ru.value.localeCompare(b.entity.labels.ru.value)
	})
	return res
}
async function getMatches(a)
{
	let res = []
	if (!a) return res
	for (let i=0; i<a.length; i++)
	{
		let _ = await wikidata(a[i].mainsnak.datavalue.value.id)
		let t1=0, t2=1, teams = _.claims['P1923']
		if (_P(3831, teams[0]) == 'Q24633216') { t1=1; t2=0 }
		_.score = _P(1351, teams[t1])+':'+_P(1351, teams[t2])
		_.timestamp = new Date(_P(585, _)).getTime()
		res.push(_)
	}
	// сортируем по дате
	res.sort((a,b)=>a.timestamp-b.timestamp)
	return res
}
function _P(P, a)
{
	if (!a) return ''
	if (a.qualifiers) a = a.qualifiers
	if (a.claims) a = a.claims
	if (!a['P'+P]) return ''
	a = a['P'+P]
	if (a.length) a = a[0]
	if (a.mainsnak) a = a.mainsnak
	if (a.datatype == 'quantity')
		return parseInt(a.datavalue.value.amount)
	if (a.datatype == 'time')
		return _t(a.datavalue.value.time)
	if (a.datatype == 'wikibase-item')
		return a.datavalue.value.id
	return ''
}
function _t(x)
{
	let t = new Date(x.replace(/^\+/, ''))
	return _z(t.getDate())+'.'+_z(t.getMonth()+1)+'.'+t.getFullYear()
}
function _z(x) { return x<10?'0'+x:x }



async function wikidata(Q)
{
	let st = localStorage.getItem(Q)
	let a; try { a = JSON.parse(st) } catch(e){}
	if (!a) a = {}
	if (new Date().getTime() - a.timestamp < 4*3600*1000)
		return a
	a = await wikidata_search(Q)
	a.timestamp = new Date().getTime()
	localStorage.setItem(Q, JSON.stringify(a))
	return a
}

async function wikidata_search(Q)
{
	return fetch('https://www.wikidata.org/wiki/Special:EntityData/'+Q+'.json')
		.then(_=>_.json()).then(_=>_.entities[Q])
}

function _wd(Q) { return '<sup><a href="https://www.wikidata.org/wiki/'+Q+'">[wd]</a></sup>'; }
function _label(a)
{
	let x = 'ru'
	if (!a.labels[x]) x = 'en'
	return a.labels[x].value
}
function _sitelink(a)
{
	let x = 'ruwiki'
	if (!a.sitelinks[x]) x = 'enwiki'
	if (!a.sitelinks[x]) x = 'frwiki'
	return a.sitelinks[x].url
}
