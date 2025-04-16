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
	if (re = /tournament=(Q\d+)/.exec(hash))  return loadTournament(re[1])
	if (re = /competition=(Q\d+)/.exec(hash)) return loadCompetition(re[1])
	loadMain()
}

function loadMain() { document.body.innerHTML = document.body.restore }


async function loadTournament(Q)
{
	const page = new Section()

	page.replace(document.body)
	page.append(_header)

	wikidata(Q).then(a=>{
		page.append('<h1><a href="'+_sitelink(a)+'">'+_label(a)+'</a>'+_wd(Q)+'</h1>')
		page.append(''
			+'<button onclick="searchCompetitions(\''+Q+'\')" title="Найти в wikidata соренования привязанные к чемпионату">Заполнить список</button>'
			+'<button onclick="fixNavigation(\''+Q+'\')" title="Исправить ссылки на предыдущий/следующий чемпионаты">Исправить линковку</button>'
		)
		page.append(getCompetitions(a.claims['P527']).then(drawCompetitions))
	})
}

function searchCompetitions(Q)
{
	wikidata_search_pv({'P31|P31/P279': 'Q27020041', P3450: Q}).then(async a=>{
		let b = []
		for (let i=0; i<a.length; i++)
		{
			const entity = await wikidata(_value(a[i]))
			b.push({id: entity.id, label: _label(entity, 'en')})
		}
		b.sort((x,y)=>x.label.localeCompare(y.label))
		let st = ''
		for (let i=0; i<b.length; i++)
			st += Q+"\tP527\t"+b[i].id+"\n"
		sendToQuickStatements(st)
	})
}

function fixNavigation(Q)
{
	let st = '', a = g_data.competitions
	for (let i=0; i<a.length; i++)
	{
		st += a[i].id+"\tP3450\t"+Q
		if (i!==0)
		st += "\tP155\t"+a[i-1].id
		if (i!==a.length-1)
		st += "\tP156\t"+a[i+1].id
		st += "\n"
	}
	sendToQuickStatements(st)
}

async function loadCompetition(Q)
{
	const page = new Section()

	page.replace(document.body)
	page.append(_header)

	wikidata(Q).then(a=>{
		page.append(drawNavPrevNext(a))
		page.append('<h1><a href="'+_sitelink(a)+'">'+_label(a)+'</a>'+_wd(Q)+'</h1>')

		page.append('<h3>Турнирная таблица</h3>')
		page.append(getTeams(a.claims['P1923']).then(drawTeamResults))

		page.append('<h3>Шахматка игр</h3>')
		page.append(getMatches(a.claims['P527']).then(drawCrossTable))

		page.append('<h3>Сыгранные матчи</h3>')
		page.append(getMatches(a.claims['P527']).then(drawMatches))
	})

//	if (_[0])  year = _P(585, _[0]).replace(/-.+/, '')
//	if (!year) year = _label(a).replace(/.*?(\d+).*~~~~~~~/, '$1')
}
