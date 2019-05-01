client_script 'config.lua'
client_script 'client.lua'
--client_script 'example.lua'
server_script 'config.lua'
server_script '@mysql-async/lib/MySQL.lua'
server_script 'server.lua'

ui_page 'ui/public/index.html'

files {
	'ui/public/index.html',
    'ui/public/global.css',
    'ui/public/bundle.css',
    'ui/public/bundle.js'
}