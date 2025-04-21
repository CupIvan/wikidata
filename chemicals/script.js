function onHashChanged(a)
{
	if (a.item) loadItem(a.item, a.isomers)
}

async function loadItem(Q, isomers)
{
	const page = new Section()

	page.replace(document.body)
	page.append(_header)

	wikidata(Q).then(async a=>{
		page.append(getParentIsomers(a).then(drawParents))
		page.append('<h1><a href="#?item='+Q+'">'+_label(a)+'</a>'+_w(a)+_wd(a)+'</h1>')
		if (isomers == 'all')
		{
			page.append(getAllIsomers(a).then(drawIsomers))
		}
		else
		{
			page.append(getIsomers(a).then(drawIsomers))
			let h = document.location.hash
			if (h.indexOf('isomers') == -1)
			page.append('<a href="'+h+'&isomers=all">все изомеры</a>')
		}
		try { setTimeout(SmiDrawer.apply, 1000) } catch(e) {}
	})
}
