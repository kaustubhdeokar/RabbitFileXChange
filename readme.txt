Plan to make this:
node - express backend
files in current repo.<>
versioning of files done in current repo <>


node - express frontend
files in current repo<>
versioning of files done in current repo<>

network call 1  -> server request files and version from client<> &
                   response file and version.
                   server compares local version and prepares a list of files to be sent. 
                   files sent over rabbit mq by server
                   consumer receives and updates it locally.
                   
Resources:
    rabbitmq tutorials:https://www.rabbitmq.com/tutorials
    

