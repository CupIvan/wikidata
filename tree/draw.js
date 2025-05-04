async function drawFamily(_)
{
	let st = '', entity, a
	st += await drawTree(_)
	st += '<ul>'
	for (let i=0; i<_.length; i++)
	st += '<li>'+_[i][0]+' '+_[i][2]+' <a href="#?person='+_[i][1].id+'">'+_label(_[i][1])+'</a>'+_wd(_[i][1].id)
	st += '</ul>'
	return st
}

async function drawTree(_)
{
	let st = ''

function _parent(who, Q, a, j)
{
	if (Q)
	for (let i=0; i<_.length; i++)
		if (_[i][0] == who && _[i][2] == Q) return a[j] = _[i][1].id
}
function _children()
{
	const res = []
	for (let i=0; i<_.length; i++)
		if (_[i][0] == 'child') if (_[i][1].id) res.push(_[i][1].id)
	return res
}
function _td(x)
{
	let st = ''
	for (let i=0;i<x;i++) st += '<td>'
	return st
}

	let me
	for (let i=0; i<_.length; i++)
		if (_[i][0] == 'me') me = _[i][1].id

	let g1 = []
	_parent('father', me, g1, 0)
	_parent('mother', me, g1, 1)

	let g2 = []
	_parent('father', g1[0], g2, 0)
	_parent('mother', g1[0], g2, 1)
	_parent('father', g1[1], g2, 2)
	_parent('mother', g1[1], g2, 3)

	let g3 = []
	_parent('father', g2[0], g3, 0)
	_parent('mother', g2[0], g3, 1)
	_parent('father', g2[1], g3, 2)
	_parent('mother', g2[1], g3, 3)
	_parent('father', g2[2], g3, 4)
	_parent('mother', g2[2], g3, 5)
	_parent('father', g2[3], g3, 6)
	_parent('mother', g2[3], g3, 7)

	let children = _children()

	st += '<table class="tree">'
	if (g3.length)
	st += '<tr>'
		+'<td colspan=2 class="person">'+await _person(g3[0])
		+_td(2)
		+'<td colspan=2 class="person">'+await _person(g3[1])
		+_td(2)
		+'<td colspan=2 class="person">'+await _person(g3[2])
		+_td(2)
		+'<td colspan=2 class="person">'+await _person(g3[3])
		+_td(2)
		+'<td colspan=2 class="person">'+await _person(g3[4])
		+_td(2)
		+'<td colspan=2 class="person">'+await _person(g3[5])
		+_td(2)
		+'<td colspan=2 class="person">'+await _person(g3[6])
		+_td(2)
		+'<td colspan=2 class="person">'+await _person(g3[7])
	if (g3.length)
	st += '<tr>'
		+_td(1)
		+'<td colspan=4 class="bl br bb">'
		+_td(4)
		+'<td colspan=4 class="bl br bb">'
		+_td(4)
		+'<td colspan=4 class="bl br bb">'
		+_td(4)
		+'<td colspan=4 class="bl br bb">'
		+_td(1)
		+'<tr>'
		+_td(2)
		+'<td class="br">'
		+_td(7)
		+'<td class="br">'
		+_td(7)
		+'<td class="br">'
		+_td(7)
		+'<td class="br">'
		+_td(3)
//	if (g2.length)
	st += '<tr>'
		+_td(g3.length ? 2 : 0)
		+'<td colspan=2 class="person">'+await _person(g2[0])
		+_td(g3.length ? 6 : 2)
		+'<td colspan=2 class="person">'+await _person(g2[1])
		+_td(g3.length ? 6 : 2)
		+'<td colspan=2 class="person">'+await _person(g2[2])
		+_td(g3.length ? 6 : 2)
		+'<td colspan=2 class="person">'+await _person(g2[3])
		+_td(g3.length ? 2 : 0)
//	if (g2.length)
	st += '<tr>'
		+_td(g3.length ? 3 : 1)
		+'<td colspan='+(g3.length ? 8 : 4)+' class="bl br bb">'
		+_td(g3.length ? 8 : 4)
		+'<td colspan='+(g3.length ? 8 : 4)+' class="bl br bb">'
		+_td(g3.length ? 3 : 1)
		+'<tr>'
		+_td(g3.length ? 4 : 2)
		+'<td class="br">'
		+_td(g3.length ? 17 : 7)
		+'<td class="br">'
		+_td(g3.length ? 7 : 3)
//	if (g1.length)
	st += '<tr>'
		+_td(g3.length ? 4 : 2)
		+'<td colspan=2 class="person">'+await _person(g1[0])
		+_td(g3.length ? 16 : 6)
		+'<td colspan=2 class="person">'+await _person(g1[1])
		+_td(g3.length ? 6 : 2)
//	if (g1.length)
	st += '<tr>'
		+_td(g3.length ? 5 : 3)
		+'<td colspan='+(g3.length ? 18 : 8)+' class="bl br bb">'
		+_td(g3.length ? 7 : 3)
	st += '<tr>'
		st += '<tr>'
			+'<td colspan='+(g3.length ? 30 : 14)+' style="padding: 0">'
			+'<table class="tree">'
			+'<tr><td class=br><td>'
			+'<tr><td colspan=2 class="person">'+await _person(me)
			+(children.length>1?'<tr><td class=br><td>':'')
			+'</table>'
	if (children.length)
	{
		st += '<tr><td colspan='+(g3.length ? 30 : 14)+' style="padding: 0">'
		st += '<table class="tree">'
		st += '<tr>'
		for (let i=0; i<children.length; i++)
			st += '<td class="br'+(i?' bt':'')+'">'+(i<children.length-1?'<td class="bt"><td class="bt">':'<td>')
		st += '<tr>'
		for (let i=0; i<children.length; i++)
			st += '<td colspan=2 class="person">'+await _person(children[i])+(i<children.length-1?'<td>':'')
		st += '</table>'
	}
	st += '</table>'
	return st
}

async function _person(x)
{
	if (!x) return ''
	let st = ''
	x = await wikidata(x)
	const name = _label(await wikidata(_P(735, x)))
	st += _wd(x)
	st += '<a href="#?person='+x.id+'" title="'+_label(x)+'">'+(name||_label(x))+'</a>'
	st += '<br>'
	st += '<small>'+_d(_P(569, x)) + '—' + _d(_P(570, x))+'</small>'
	return st
}

function _d(x)
{
	let st = ''
	let t = new Date(x)
	st = t.getFullYear() || '?'
	st = '<span title="'+(x||'')+'">'+st+'</span>'
	return st
}
