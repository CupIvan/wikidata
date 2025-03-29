window.addEventListener('load', _=>onHashChanged(document.body.restore=document.body.innerHTML))
window.addEventListener('hashchange', onHashChanged)

function _header()
{
	return '<small><a href="#">Главная</a>'
		+' | <a href="#clear" onclick="'
		+'localStorage.clear(); console.log("localStorage: CLEAR"); return false'
		+'">очистить localStorage</a></small>'
}
function _loading() { if (!_loading.ck) _loading.ck=1; document.body.innerHTML = _header()+'<br>Загрузка данных... '+(_loading.ck++) }
function _error(e){ console.error(e); return _header()+'<br>Ошибка :-( '+e; }

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
	let st = '', _
try {
	let a = await wikidata(Q)

	st += _header()
	st += await getNavPrevNext(a)
	st += '<h1><a href="'+_sitelink(a)+'">'+_label(a)+'</a>'+_wd(Q)+'</h1>'

	st += '<h3>Турнирная таблица</h3>'
	_ = await getTeams(a.claims['P1923']) // команды-участницы
	st += '<table class="t">'
	st += '<tr><th>Поз<th>Команда<th>И<th>В<th>Н<th>П<th>МЗ<th>МП<th>РМ<th>О'
	for (let i=0,w,d,g,s; i<_.length; i++)
	{
		st += '<tr>'
		st += '<td class="r">'+_P(1352, _[i]) // position
		st += '<td><a href="'+_sitelink(_[i].entity)+'">'+_label(_[i].entity)+'</a>'+_wd(_[i].entity.id)
		st += '<td class="c">'+_P(1350, _[i]) // total
		st += '<td class="c">'+(w=_P(1355, _[i])) // wins
		st += '<td class="c">'+(d=_P(1357, _[i])) // draws
		st += '<td class="c">'+_P(1356, _[i]) // fails
		st += '<td class="c">'+(g=_P(1351, _[i])) // goals
		st += '<td class="c">'+(s=_P(1359, _[i])) // skips
		st += '<td class="r">'+(g-s>0?'+'+(g-s):g-s) // delta
		st += '<td class="c">'+(w*3+d) // points
	}
	st += '</table>'

	_ = await getMatches(a.claims['P527']) // состоит из

	if (_.crosstable)
	{
		st += '<h3>Шахматка игр</h3>'
		st += '<table class="t">'
		st += '<tr><th>Дома \\ На выезде<th>И<th>В<th>Н<th>П<th>МЗ<th>МП<th>РМ<th>О<th>Поз'
		for (let i=0; i<_.results.length; i++)
			st += '<th>'+_.results[i].position
		for (let i=0; i<_.results.length; i++)
		{
			let Q1 = _.results[i].Q, team = await wikidata(Q1)
			st += '<tr>'
			st += '<td><a href="'+_sitelink(team)+'">'+_label(team)+'</a>'+_wd(Q1)
			st += '<td>'+_.results[i].total
			st += '<td>'+_.results[i].wins
			st += '<td>'+_.results[i].draws
			st += '<td>'+_.results[i].fails
			st += '<td>'+_.results[i].goals
			st += '<td>'+_.results[i].skips
			st += '<td>'+_.results[i].delta
			st += '<td>'+_.results[i].points
			st += '<th>'+_.results[i].position
			for (let j=0; j<_.results.length; j++)
			if (i == j)
				st += '<td>—'
			else
			{
				let Q2 = _.results[j].Q
				const a = _.crosstable[Q1][Q2].score.split(':')
				let cl = 'yellow'
				if (a[0]>a[1]) cl = 'green'
				if (a[0]<a[1]) cl = 'red'
				st += '<td class="'+cl+'">'+a.join(':')
			}
		}
		st += '</table>'
	}

	st += '<h3>Сыгранные матчи</h3>'
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
async function getNavPrevNext(a)
{
	let st = ''
	let entity = await wikidata(_P(3450, a)) // parent
	st += '<h2><a href="#?tournament='+entity.id+'">'+_label(entity)+'</a>'+_wd(entity.id)+'</h2>'
	st += '<ul>'
	entity = await wikidata(_P(155, a.claims['P3450'][0]))
	st += '<li><a href="#?competition='+entity.id+'">'+(_label(entity)||'предыдущий не заполнен')+'</a>'+_wd(entity.id)
	entity = await wikidata(_P(156, a.claims['P3450'][0]))
	st += '<li><a href="#?competition='+entity.id+'">'+(_label(entity)||'следующий не заполнен')+'</a>'+_wd(entity.id)
	st += '</ul>'
	return st
}
async function getTeams(a)
{
	let res = []
	if (!a) return res
	for (let i=0; i<a.length; i++)
	{
		a[i].entity = await wikidata(a[i].mainsnak.datavalue.value.id)
		a[i].label  = _label(a[i].entity)
		let x = 'ru'
		res.push(a[i])
	}
	// сортируем по названию
	res.sort((a,b)=>{
		a.label.localeCompare(b.label)
	})
	return res
}
async function getMatches(a)
{
	let res = []; res.crosstable = {}; res.results = {}
	if (!a) return res
	for (let i=0; i<a.length; i++)
	{
		let _ = await wikidata(a[i].mainsnak.datavalue.value.id)
		let t1=0, t2=1, teams = _.claims['P1923']
		if (_P(3831, teams[0]) == 'Q24633216') { t1=1; t2=0 }
		let s = [_P(1351, teams[t1]), _P(1351, teams[t2])]
		_.score = s.join(':')
		_.date = _P(585, _)
		res.push(_)

		t1 = _value(teams[t1])
		t2 = _value(teams[t2])
		if (!res.crosstable[t1]) res.crosstable[t1] = {}
		res.crosstable[t1][t2] = {score: _.score, date: _.date}

		if (!res.results[t1]) res.results[t1]={total:0, wins:0, draws:0, fails:0, goals:0, skips:0}
		if (!res.results[t2]) res.results[t2]={total:0, wins:0, draws:0, fails:0, goals:0, skips:0}
		res.results[t1].total++
		res.results[t2].total++
		res.results[t1].goals += s[0]; res.results[t2].skips += s[0]
		res.results[t2].goals += s[1]; res.results[t1].skips += s[1]
		if (s[0] > s[1]) { res.results[t1].wins++;  res.results[t2].fails++; }
		if (s[0] < s[1]) { res.results[t1].fails++; res.results[t2].wins++;  }
		if (s[0] ==s[1]) { res.results[t1].draws++; res.results[t2].draws++; }
	}
	// сортируем по дате
	res.sort((a,b)=>a.date.localeCompare(b.date))
	// сортируем результаты
	let Q, x, y, _ = []
	for (Q in res.results)
	_.push({...res.results[Q], Q,
		points: x=res.results[Q].wins * 3 + res.results[Q].draws,
		delta:  y=res.results[Q].goals - res.results[Q].skips,
		sort:   x * 10000 + y,
	})
	_.sort((a,b)=>b.sort-a.sort)
	for (let i=0;i<_.length;i++) _[i].position = i+1
	res.results = _
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
	return _value(a)
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
	if (new Date().getTime() - a.timestamp < _rnd(4,100)*3600*1000) // в кеше от 4 до 100 часов
		return a
	_loading()
	a = await wikidata_search(Q)
	a.timestamp = new Date().getTime()
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

function _wd(Q) { return !Q?'':'<sup><a href="https://www.wikidata.org/wiki/'+Q+'">[wd]</a></sup>'; }
function _label(a)
{
	if (!a.labels) return ''
	let x = 'ru'
	if (!a.labels[x]) x = 'en'
	return a.labels[x].value||''
}
function _sitelink(a)
{
	if (!a.sitelinks) return ''
	let x = 'ruwiki'
	if (!a.sitelinks[x]) x = 'enwiki'
	if (!a.sitelinks[x]) x = 'frwiki'
	return a.sitelinks[x] ? a.sitelinks[x].url : ''
}
