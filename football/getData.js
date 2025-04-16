const g_data = {}

function getTeams(a)
{
	return new Observer(async (handler) => {

	const res = []
	if (!a) return res
	for (let i=0; i<a.length; i++)
	{
		a[i].entity = await wikidata(_value(a[i]))
		a[i].label  = _label(a[i].entity)
		a[i].position = parseInt(_P(1352, a[i])||99)
		let x = 'ru'
		res.push(a[i])
		handler(res)
	}
	// сортируем
//	res.sort((a,b)=>a.label.localeCompare(b.label)) // по названию
	res.sort((a,b)=>a.position-b.position) // по позиции
	handler(res)

	})
}

function getMatches(a)
{
	return new Observer(async (handler) => {

	const res = []; res.crosstable = {}; res.results = {}

	function add(_)
	{
		let t1=0, t2=1, teams = _.claims['P1923']
		if (!teams) return
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

	if (!a) return res
	for (let i=0; i<a.length; i++)
	{
		let _ = await wikidata(_value(a[i]))
		if (_P(31, _) == 'Q58092637') // тур группового этапа
			for (let j=0, b=_PP('527', _); j<b.length; j++)
			{
				add(await wikidata(b[j]))
				handler(res)
			}
		else // Q133729849 - футбольный матч
		{
			add(_)
			handler(res)
		}
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
	handler(res)

	})
}

function getCompetitions(a)
{
	return new Observer(async (handler) => {

	let res = []
	if (!a) return res
	for (let i=0; i<a.length; i++)
	{
		let _ = await wikidata(_value(a[i]))
		_.label     = _label(_)
		_.dateStart = _P(580, _)
		if (!_.dateStart) _.dateStart = ''+parseInt(_label(_, 'en'))
		res.push(_)
		g_data.competitions = res
		handler(res)
	}
	res.sort((a,b)=>a.dateStart.localeCompare(b.dateStart))
	g_data.competitions = res
	handler(res)

	})
}
