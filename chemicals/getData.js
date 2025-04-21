function getParentIsomers(a)
{
	return new Observer(async (handler) => {

	const res = [], pp = _PP(279, a)
	for (let i=0; i<pp.length; i++)
	{
		res.push(await wikidata(pp[i]))
		handler(res)
	}

	})
}

function getIsomers(a)
{
	return new Observer(async (handler) => {

	const res=[], pv = await wikidata_search_pv({'P279':a.id})
	for (let i=0; i<pv.length; i++)
	{
		res.push(await wikidata(_value(pv[i])))
		handler(res)
	}

	})
}

function getAllIsomers(a)
{
	return new Observer(async (handler) => {

	const res=[], pv = await wikidata_search_pv({'P279*':a.id, 'P31': 'Q113145171'})
	for (let i=0; i<pv.length; i++)
	{
		let x = await wikidata(_value(pv[i]))
		x.sort = _label(x, 'en').replace(/.+?([a-z]{3})/,'$1')+_label(x, 'en')
		res.push(x)
		handler(res)
	}
	res.sort((a,b)=>a.sort.localeCompare(b.sort))
	handler(res)

	})
}
