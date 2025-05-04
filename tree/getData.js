function getFamily(a)
{
	return new Observer(async (handler) => {

	const res = []

	function _add(x, y, z) { if (!y||!y.id) return; res.push([x, y, z||a.id]); handler(g_data = res) }

	let x,y
	_add('me',      a)
	_add('father',x=await wikidata(_P(22, a)))
	if (x)
	{
		_add('father',y=await wikidata(_P(22, x)), x.id)
		if (y)
		{
			_add('father', await wikidata(_P(22, y)), y.id)
			_add('mother', await wikidata(_P(25, y)), y.id)
		}
		_add('mother',y=await wikidata(_P(25, x)), x.id)
		if (y)
		{
			_add('father', await wikidata(_P(22, y)), y.id)
			_add('mother', await wikidata(_P(25, y)), y.id)
		}
	}
	_add('mother',x=await wikidata(_P(25, a)))
	if (x)
	{
		_add('father',y=await wikidata(_P(22, x)), x.id)
		if (y)
		{
			_add('father', await wikidata(_P(22, y)), y.id)
			_add('mother', await wikidata(_P(25, y)), y.id)
		}
		_add('mother',y=await wikidata(_P(25, x)), x.id)
		if (y)
		{
			_add('father', await wikidata(_P(22, y)), y.id)
			_add('mother', await wikidata(_P(25, y)), y.id)
		}
	}
	x = _PP(26,   a); for (let i=0; i<x.length; i++) _add('spouse',  await wikidata(x[i]))
	x = _PP(451,  a); for (let i=0; i<x.length; i++) _add('partner', await wikidata(x[i]))
	x = _PP(40,   a); for (let i=0; i<x.length; i++) _add('child',   await wikidata(x[i]))
	x = _PP(3373, a); for (let i=0; i<x.length; i++) _add('sibling', await wikidata(x[i]))

	})
}
