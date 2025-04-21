async function drawParents(a)
{
	let st = []
	for (let i=0; i<a.length; i++)
		st.push('<a href="#?item='+a[i].id+'">'+_label(a[i])+'</a>'+_wd(a[i]))
	return '<h3>'+st.join(', ')+'</hr>'
}
async function drawIsomers(a)
{
	let st = []
	for (let i=0; i<a.length; i++)
	{
		let SMILE = _P(2017, a[i])
		st.push('<tr>'
			+'<td><a href="#?item='+a[i].id+'">'+_label(a[i])+'</a>'+_wd(a[i])
			+'<td>'+_aliases(a[i]).join('; ')
			+(!SMILE?'':'<td><img style="cursor:pointer "onclick="this.height=(this.height!=400?400:100)" height=100 data-smiles="'+SMILE+'" data-smiles-options="{\'height\': 400, \'padding\': 0}"/>')
		)
	}
	return '<table class="t">'+st.join('')+'</table>'
}
