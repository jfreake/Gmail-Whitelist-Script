Gmail-Whitelist-Script
======================

A Google Apps Script used to move messages from whitelisted addresses back to the inbox


The motivation for this script is that Gmail doesn't have any better way of whitelisting email addresses other then adding them to your address book. I wanted to whitelist addresses but I didn't want every newsletter/subscription/notification email address cluttering up my gmail which then gets synced to my phone/tablet etc.

This script runs as a Google Drive GScript that is attached to an hourly trigger.
It is best used if you like to keep your spam box empty and or at a low volume.
It uses the ScriptDB to store a list of whitelisted email addresses.
When it scans the SPAM box hourly, it does a few things:
1. Any senders of messages that have the "Whitelist" label get added to the whitelist DB.
2. Any messages from addresses in the DB get moved out of the SPAM box and put in the inbox with a whitelist label.
3. Any messages that have a known spammy wird in it, get deleted right away.

INSTRUCTIONS
- Clean out your SPAM box before running this. Gscript is slow and it will take a long time to sift through thousands of messages. It works best below 200 messages.
- Go into GDrive, create a new script file and call is ProcessSpam
- Edit the script and paste the contents of ProcessSpam.gs into your script
- Under the "Resources" menu in the script editor, choose "All Your Triggers"
- Click "Add a new trigger"
- Set the values to 
  - Run: ProcessSpamBox
  - Events: Time-driven - Hour Timer - Every Hour
- The first time the script runs, it will create the labels if they dont already exist.
- Label your known good spam messages with the whitelist lasbel to have them added to the DB.

TODOs
- Send a warning email if the SPAM folder is greater than 100 messages (and stop scanning). Gscript is not very fast and if the SPAM box gets big, the script would be running all the time!
- Extra validation before commiting a whitelist address to the DB (sometimes a blank one gets in there)
- Improve documentation
