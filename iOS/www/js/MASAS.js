var MASAS_FEED_URL = '';
var MASAS_USER_SECRET = '';

function MASAS_createNewEntry( entry )
{
	var postData = '';
	
	postData = '<?xml version="1.0" encoding="UTF-8"?>';
	postData += '<entry xmlns="http://www.w3.org/2005/Atom">';
	postData += '<category label="Status" scheme="masas:category:status" term="' + entry.status + '"/>';
	postData += '<category label="Icon" scheme="masas:category:icon" term="' + entry.icon + '"/>';
	postData += '<title type="xhtml">';
	postData += '<div xmlns="http://www.w3.org/1999/xhtml">';
	postData += '<div xml:lang="en">' + entry.title + '</div>';
	postData += '</div>';
	postData += '</title>';
	postData += '<content type="xhtml">';
	postData += '<div xmlns="http://www.w3.org/1999/xhtml">';
	postData += '<div xml:lang="en">' + entry.content + '</div>';
	postData += '</div>';
	postData += '</content>';
	
	//if( entry.hasOwnProperty( "summary") )
	if( "summary" in entry )
	{
		postData += '<summary type="xhtml">';
		postData += '<div xmlns="http://www.w3.org/1999/xhtml">';
		postData += '<div xml:lang="en">' + entry.summary + '</div>';
		postData += '</div>';
		postData += '</summary>';
	}
	
	postData += '<expires xmlns="http://purl.org/atompub/age/1.0">' + entry.expires.toISOString() + '</expires>';
	postData += '<point xmlns="http://www.georss.org/georss">' + entry.point.latitude + ' ' + entry.point.longitude + '</point>';
	postData += '</entry>';

	if( "attachments" in entry && entry.attachments.length > 0 )
	{
		MASAS_postNewEntryWithAttachments( postData, entry.attachments );
	}
	else
	{
		MASAS_postNewEntry( postData );
	}
}

function MASAS_postNewEntry( entryData )
{
	$.ajax({
		type: 'POST',
		url: MASAS_FEED_URL,
		headers: {'Content-Type': 'application/atom+xml',
				  'Authorization': 'MASAS-Secret ' + MASAS_USER_SECRET },
		data: entryData,
		success: function(data){
			console.log(data);
			alert('Posted to MASAS Hub successfully!');
		},
		error: function(data){
			console.log(data);
			alert('Posting failed!');
		}
	});
}

function MASAS_postNewEntryWithAttachments( entryData, attachments )
{
	var newData = '';
	newData  = '--0.a.unique.value.0\r\n';
	newData += 'Content-Disposition: attachment; name="entry"; filename="entry.xml"\r\n';
	newData += 'Content-Type: application/atom+xml\r\n';
	newData += '\r\n';
	newData += entryData;
	newData += '\r\n';
	
	for( var i=0; i<attachments.length; i++ )
	{
		if( attachments[0].Type == 'Image' )
		{
			newData += '--0.a.unique.value.0\r\n';
			newData += 'Content-Disposition: attachment; name="attachment"; filename="file.txt"\r\n';
			//newData += 'Content-Type: image/jpeg';
			newData += 'Content-Type: text/plain\r\n';
			//newData += 'Content-Description: Image attachment';
			newData += 'Content-Description: Test attachment\r\n';
			newData += '\r\n';
			newData += 'A sample text file.\r\n';
			
			// FileEntry fileEntry = new FileEntry();
			// fileEntry.fullPath = attachment[0].Path;
			// File currentFile = fileEntry.file();

			try{
				if (blackberry.io.file.exists(attachments[0].Path)) {
					blackberry.io.file.readFile(attachments[0].Path, handleOpenedFile);
				} 
			}
			catch (ex) {
				alert("exist: " + ex.toString(0));
			}
			
		}
	
	}
	newData += '--0.a.unique.value.0--\r\n';

	// $.ajax({
		// type: 'POST',
		// url: MASAS_FEED_URL,
		// headers: {'Content-Type': 'multipart/related; boundary=0.a.unique.value.0',
				  // 'Authorization': 'MASAS-Secret ' + MASAS_USER_SECRET },
		// data: newData,
		// success: function(data){
			// console.log(data);
			// alert('Posted to MASAS Hub successfully!');
		// },
		// error: function(data){
			// console.log(data);
			// alert('Posting failed!');
		// }
	// });
	
}

// function handleOpenedFile(fullPath, blobData) // callback function that is passed when using the blackberry.io.file.readFile API
// {
	// xmlString = blackberry.utils.blobToString(blobData);
	// console.log(xmlString);
// }