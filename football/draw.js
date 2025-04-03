async function drawTeamResults(_)
{
	const v = (x,i) => _P(x, _[i]) || ''
	let st = ''
	st += '<table class="t">'
	st += '<tr><th>Поз<th>Команда<th>И<th>В<th>Н<th>П<th>МЗ<th>МП<th>РМ<th>О'
	for (let i=0,w,d,g,s; i<_.length; i++)
	{
		st += '<tr>'
		st += '<td class="r">'+v(1352,i) // position
		st += '<td><a href="'+_sitelink(_[i].entity)+'">'+_label(_[i].entity)+'</a>'+_wd(_[i].entity.id)
		st += '<td class="c">'+v(1350,i) // total
		st += '<td class="c">'+(w=v(1355,i)) // wins
		st += '<td class="c">'+(d=v(1357,i)) // draws
		st += '<td class="c">'+v(1356,i) // fails
		st += '<td class="c">'+(g=v(1351,i)) // goals
		st += '<td class="c">'+(s=v(1359,i)) // skips
		st += '<td class="r">'+(g-s>0?'+'+(g-s):g-s) // delta
		st += '<td class="c">'+(w*3+d) // points
	}
	st += '</table>'
	return st
}

async function drawMatches(_)
{
	let st = ''
	st += '<table class="t">'
	st += '<tr><th>Дата<th>Команды<th>Счёт'
	for (let i=0; i<_.length; i++)
	{
		st += '<tr>'
		st += '<td>'+_P(585, _[i])+_wd(_[i].id)
		st += '<td>'+_label(_[i])
		st += '<td class="c">'+_[i].score
	}
	st += '</table>'
	return st
}

async function drawCrossTable(_)
{
	let a = _.results
	if (!a.length) // на этапе формирования результатов вместо массива хэш
	{
		let Q, _ = JSON.parse(JSON.stringify(a))
		a=[]; for(Q in _) a.push({Q, ..._[Q]})
	}
	let st = ''
	st += '<table class="t">'
	st += '<tr><th>Дома \\ На выезде<th>И<th>В<th>Н<th>П<th>МЗ<th>МП<th>РМ<th>О<th>Поз'
	for (let i=0; i<a.length; i++)
		st += '<th>'+(a[i].position||'')
	for (let i=0; i<a.length; i++)
	{
		let Q1 = a[i].Q, team = await wikidata(Q1)
		st += '<tr>'
		st += '<td><a href="'+_sitelink(team)+'">'+_label(team)+'</a>'+_wd(Q1)
		st += '<td>'+a[i].total
		st += '<td>'+a[i].wins
		st += '<td>'+a[i].draws
		st += '<td>'+a[i].fails
		st += '<td>'+a[i].goals
		st += '<td>'+a[i].skips
		st += '<td>'+(a[i].delta||'')
		st += '<td>'+(a[i].points||'')
		st += '<th>'+(a[i].position||'')
		for (let j=0; j<a.length; j++)
		if (i == j)
			st += '<td>—'
		else
		{
			let Q2 = a[j].Q
			if (!_.crosstable || !_.crosstable[Q1] || !_.crosstable[Q1][Q2]) { st += '<td>?'; continue; }
			const s = _.crosstable[Q1][Q2].score.split(':')
			let cl = 'yellow'
			if (s[0]>s[1]) cl = 'green'
			if (s[0]<s[1]) cl = 'red'
			st += '<td class="'+cl+'">'+s.join(':')
		}
	}
	st += '</table>'
	return st
}

async function drawNavPrevNext(a)
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

async function drawCompetitions(_)
{
	let st = ''
	st += '<ol>'
	for (let i=0; i<_.length; i++)
		st += '<li><a href="#?competition='+_[i].id+'">'+_label(_[i])+'</a>'
	st += '</ol>'
	return st
}
