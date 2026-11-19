import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 8000

app.get('/',(req,res)=>{
    res.send('FixMate Server is running successfully')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})