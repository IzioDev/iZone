fx_version 'adamant'

game 'gta5'

dependencies {
  'mysql-async',
}

client_scripts {
  'config.lua',
  'client.lua',
  -- client_script 'example.lua'
} 

server_scripts {
  'config.lua',
  '@mysql-async/lib/MySQL.lua',
  'utils.lua',
  'server.lua',
}

files {
	'ui/public/index.html',
  'ui/public/global.css',
  'ui/public/build/bundle.css',
  'ui/public/build/bundle.js'
}

ui_page 'ui/public/index.html'
