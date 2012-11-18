
**** IMPORTANT PATCH FOR BLACKBERRY WEBWORKS TABLET 2.2.0.5

Here's s good article to learn how to patch WebWorks in general:
    http://devblog.blackberry.com/2012/04/webworks-sdk-extensions-patching/

There is a new "binary" option in the patch that needs to be used when converting from a binary file to a base64 string.
Otherwise, reading a file and converting it to base64 will not work ( reader.readAsDataURL() ).

1. The first step is to get the patch from GIT:
    https://github.com/blackberry/WebWorks-TabletOS/pull/57/files

   You can get the file via the "View file @ 970e2e1" button.

2. Apply the changes to your SDK's "Utilities.as" file (overwrite with the file you just retrieved) found here:
    C:\Program Files (x86)\Research In Motion\BlackBerry WebWorks SDK for TabletOS 2.2.0.5\bbwp\ext\blackberry.utils\src\Air\Utilities\src\blackberry\utils

3. MODIFY CORDOVA!!!  The version in GIT should already be patched, but if any upgrade is done the patch may need to be
   re-applied:

        - open cordova-2.2.0.js
        - Go to line 4569
        - Change:
                var enc = "BASE64";
          To:
                var enc = "binary";

4. Rebuild and test.