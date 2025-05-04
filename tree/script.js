function onHashChanged(a)
{
	if (a.person) loadPerson(a.person)
}

async function loadPerson(Q)
{
	const page = new Section()

	page.replace(document.body)
	page.append(_header)

	wikidata(Q).then(a=>{
		page.append('<h1><a href="'+_sitelink(a)+'">'+_label(a)+'</a>'+_wd(Q)+'</h1>')
		page.append(getFamily(a).then(drawFamily))
	})
}
