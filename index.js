require('dotenv').config()
const spconf = require('sp-conf')
const fetch = require('node-fetch')
const moment = require('moment')

const config = {
  xboxApiUser: spconf.readPassword('XBOXAPI_USER'),
  xboxApiKey: spconf.readPassword('XBOXAPI_KEY'),
  dbUrl: spconf.readString('DB_URL'),
  dbUser: spconf.readString('DB_USER'),
  dbPass: spconf.readPassword('DB_PASS')
}

if (spconf.missingEnvVars) {
  console.error('Some required env vars were missing. Terminating')
  process.exit(1)
}

log()
setInterval(() => log(), 60000)

function log() {
  const xboxApiOpts = {
    headers: {'X-AUTH': config.xboxApiKey}
  }
  fetch(`https://xboxapi.com/v2/${config.xboxApiUser}/presence`, xboxApiOpts)
      .then(res => {
        if (res.ok) {
          return res.json()
        } else {
          return res.text().then(txt => {
            throw new Error('Error from xboxapi: ' + res.status + ' Error: ' + txt)
          })
        }
      })
      .then(body => {
        const now = moment.utc().format()
        const id = `${config.xboxApiUser}_${now}`
        body.now = now
        const opts = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + new Buffer(`${config.dbUser}:${config.dbPass}`).toString('base64')
          },
          body: JSON.stringify(body)
        }

        // console.log('opts:', opts)
        return fetch(`${config.dbUrl}${id}`, opts)
          .then(res => {
            if (res.ok) {
              console.log('Status: ', body.state, now)
            } else {
              return res.text().then(txt => {
                throw new Error('Error from xboxapi: ' + res.status + ' Error: ' + txt)
              })
            }
          })
      })
      .catch(err => {
        console.log(err)
      })
}