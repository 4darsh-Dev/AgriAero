import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import userRoutes from './src/routes/user.js'
import imagePredictionRoutes from './src/routes/imagePrediction.js'
import weatherRoutes from './src/routes/weather.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://192.168.110.180:5173',
      'http://192.168.3.117:5173',
      'https://iiituna-orchardeyes.vercel.app',
      'http://172.16.4.155:5173'
    ]
  })
)

// sse setup
let clients = []

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Send an initial connection confirmation
  // res.write(
  //   `data: ${JSON.stringify({
  //     status: 'Connected',
  //     timestamp: new Date().toISOString()
  //   })}\n\n`
  // )

  clients.push(res)

  // Remove the client when the connection closes
  req.on('close', () => {
    clients = clients.filter((client) => client !== res)
  })
})

app.get('/', (req, res) => {
  console.log('req received')
  res.send('Hello World!')
})
app.post('/farm-metrics', (req, res) => {
  console.log('req received', req.body)
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(req.body)}\n\n`)
  })

  res.json({ success: true, message: 'Data sent to SSE clients' })
})
app.use('/user', userRoutes)
app.use('/predict', imagePredictionRoutes)
app.use('/', weatherRoutes)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
