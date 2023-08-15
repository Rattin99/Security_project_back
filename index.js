const express = require('express')
const app = express()
const cors = require("cors")
const upload = require('./upload')
const encryptor = require('file-encryptor')
const bodyparser = require('body-parser')
const crypto = require("crypto");



app.use(cors())
app.use(bodyparser.urlencoded({extended:false}))

app.use(bodyparser.json())

app.get('/',(req,res)=>{
    res.send('hello world')
})

app.post('/file/:algo',upload.single('file'),(req,res) => {

    const algo = req.params.algo
    const filePath = `./uploads/${req.file.filename}`;
    const destPath = `./encrypted/${req.file.filename}.dat`
    encrypt(filePath,destPath,res,req.file.filename,algo)
    
})

app.post('/dec',(req,res) => {

   const filePath = req.body.filepath;
   const destPath = `./decrypted/${req.body.fileName}`
   const algo = req.body.algo

   console.log(algo)
   decrypt(filePath,destPath,res,algo)
})

app.post('/text',(req,res) => {

    encryptText(req.body.algo,req.body.text,res)
})

app.post('/textd',(req,res) => {

    const obj = req.body

    const Securitykey = Buffer.from(obj.Securitykey.data)
    const initVector = Buffer.from(obj.initVector.data)
    

    textDecrypt(obj.encryptedText,'AES-128-CBC',Securitykey,initVector,res)
   
})


app.listen(5000,()=> {
    console.log('ki obostha')
})


function encrypt(file,dest,res,filename,algo) {
    const key = 'my super secret key'
    const options = {algorithm : algo}

    encryptor.encryptFile(file,dest,key,options,(req) => {
        res.send(JSON.stringify({status:'done',filePath:dest,fileName:filename}));
    })
}

function decrypt(file,dest,res,algo){
    const key = 'my super secret key'
    const options = {algorithm : algo}

    encryptor.decryptFile(file,dest,key,options,() => {
        res.send(JSON.stringify({status:'decryption done'}))
    })
}


function encryptText(algo,text,res){
    const algorithm = algo; 

    // generate 16 bytes of random data
    const initVector = crypto.randomBytes(16);

    // protected data
    const message = text;

    // secret key generate 32 bytes of random data
    const Securitykey = crypto.randomBytes(16);

    // the cipher function
    const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

    // encrypt the message
    // input encoding
    // output encoding
    let encryptedData = cipher.update(message, "utf-8", "hex");

    encryptedData += cipher.final("hex");

    // const encryptedText = `${encryptedData}`
    res.send(JSON.stringify({encryptedText:encryptedData,initVector,Securitykey}))

}

function textDecrypt(encryptedData,algorithm,Securitykey,initVector,res){
    const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);

    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");

    decryptedData += decipher.final("utf8");

    console.log("Decrypted message: " + decryptedData);

    res.send(JSON.stringify({decryptedData:decryptedData}))
}