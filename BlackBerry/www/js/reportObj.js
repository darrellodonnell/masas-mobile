function reportObj( obj )
{
	//this.Identifier = nextReportIdentifier++;
	this.Title = '';
	this.Description = '';
	this.State = 'Draft';  // States: Draft, Sent
	this.Created = new Date();
	this.Updated = new Date();
	this.Attachments = [];
	this.Location = undefined;

	// FileType: File, Image, Audio
	this.AddAttachment = function( type, filePath ) {
		var attachment = { Type: type, Path: filePath };
		this.Attachments.push( attachment );
		return attachment;
	}

	this.DeleteAttachment = function( filePath )
	{
		for( var i=0; i<this.Attachments.length; i++ )
		{
			if( this.Attachments[i].Path == filePath )
			{
				this.Attachments.splice( i, 1 );
				break;
			}
		}
	}
	
	// If an object was passed in, then initialise the properties with that object...
	// NOTE: This may not be the best way to do this, but it works!
    for( var prop in obj )
	{
		this[prop] = obj[prop];
	};
	
}

function shortReportObj( obj )
{
	this.Title = '';
    this.Description = '';
	this.Location = undefined;	
}