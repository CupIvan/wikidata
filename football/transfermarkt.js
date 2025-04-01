function section_transfermarkt(year)
{
	let st='', el = document.createElement('div')
	st += '<h3>transfermarkt.com</h3>'
	let url = 'https://www.transfermarkt.com/premier-liga/gesamtspielplan/wettbewerb/RU1?saison_id='+year
	st += '<input type="search" value="'+url+'" style="width: 800px;">'
	st += '<input type="button" value="Загрузить">'
	st += '<br><textarea style="width: 900px; height: 300px"></textarea>'
	el.innerHTML = st
	el.querySelector('input[type=button]').onclick = _=>{
		fetch(el.querySelector('input[type=search]').value)
		.then(_=>_.text()).then(html=>{
			let a = html.split('class="box">')
			let st = ''
			for (let i=1; i<a.length; i++)
			{
				let j, _ = parseBox(a[i])
				for (j=0; j<_.length; j++)
				st += _.matchDay
					+ '\t' + _[j].date
					+ '\t' + _[j].time
					+ '\t' + _[j].team1Id
					+ '\t' + _[j].team2Id
					+ '\t' +_[j].score
					+ '\t' +_[j].team1Name+' - '+_[j].team2Name
					+ '\n'
			}
			el.querySelector('textarea').value = st
		})
	}
	return el
}
function parseBox(html)
{
	const res = []
	const el = document.createElement('div')
	el.innerHTML = html
	const tr = el.querySelectorAll('tr')

	try {
	if (re = /(\d+).Matchday/.exec(el.querySelector('.content-box-headline').innerHTML))
		res.matchDay = parseInt(re[1])
	} catch(e) {}

	let date = '', time = ''
	for (let i=0; i<tr.length; i++)
	if (tr[i].className != 'bg_blau_20')
	try
	{
		let re, a = {}
		let td = tr[i].querySelectorAll('td')
		if (re = /(\d{4})-(\d{2})-(\d{2})/.exec(td[0].innerHTML)) a.date = re[0]
		if (re = /(\d+):(\d+)/.exec(td[1].innerHTML)) { if (td[1].innerHTML.indexOf('PM')!=-1) re[1]=parseInt(re[1])+12; a.time = re[1]+':'+re[2] }
		if (re = /verein\/(\d+)/.exec(td[2].innerHTML))  a.team1Id   = re[1]
		if (re = /title="([^"]+)/.exec(td[2].innerHTML)) a.team1Name = re[1]
		if (re = /\d+:\d+/.exec(td[4].innerText))        a.score     = re[0]
		if (re = /verein\/(\d+)/.exec(td[6].innerHTML))  a.team2Id   = re[1]
		if (re = /title="([^"]+)/.exec(td[6].innerHTML)) a.team2Name = re[1]
		if (!a.date) a.date = date; else date = a.date
		if (!a.time) a.time = time; else time = a.time
		res.push(a)
	}
	catch(e) {}

	return res
}
