Gmail-Whitelist-Script
======================

A Google Apps Script used to move messages from whitelisted addresses back to the inbox

This script runs as a Google Drive GScript that is attached to an hourly trigger.
It uses the ScriptDB to store a list of whitelisted email addresses.
When it scans the SPAM box hourly, it does a few things:
1. Any senders of messages that have the "Whitelist" label get added to the whitelist DB.
2. Any messages from addresses in the DB get moved out of the SPAM box and put in the inbox with a whitelist label.

TODOs
- Send a warning email if the SPAM folder is greater than 100 messages (and stop scanning). Gscript is not very fast and if the SPAM box gets big, the script would be running all the time!
- Extra validation before commiting a whitelist address to the DB (sometimes a blank one gets in there)
- Improve documentation
