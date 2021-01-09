import express from 'express'

const app = express()

app.use(express.static('dist'))

const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>React Fiber</title>
    </head>
    <body>
      <div id="root"></div>
      <script src="bundle.js"></script>
    </body>
    </html>
`

app.get('*', (req, res) => {
  res.send(template)
})

app.listen(5000, () => console.log('server is running'))