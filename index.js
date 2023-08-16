const express = require('express')
const app = express()
const cors = require("cors")
const upload = require('./upload')
const encryptor = require('file-encryptor')
const bodyparser = require('body-parser')
const crypto = require("crypto");
const NodeRSA = require('node-rsa')
const { spawn } = require('child_process')

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

    if(req.body.algo == 'RSA'){
        RSA(req.body.text,res)
    }
    if(req.body.algo == 'Substitution'){
        substitueCipher(req.body.text,res)
    }
    if(req.body.algo == 'DH'){
        let key = "hill";

        const cp = spawn('python',['hill2.py',req.body.text,2,key])

        cp.stdout.on('data',(data) => {
            console.log(`${data}`)
            const d = data.toString()
            res.send(JSON.stringify({encryptedText:d}))
        })
        
        cp.stderr.on('data',(data) => {
            console.error(`${data}`)
        })
    }
    if(req.body.algo != 'DH' && req.body.algo != 'Substitution' && req.body.algo != 'RSA'){
        encryptText(req.body.algo,req.body.text,res)
    }
   
})

app.post('/textd',(req,res) => {

    const obj = req.body

    if(obj.algo == 'RSA'){
        RSAdec(obj.encryptedText,res)
    }
    if(obj.algo == 'Substitution'){
        substituePlain(obj.encryptedText,res)
    }
    if(req.body.algo == 'DH'){
        let key = "hill";

        const cp = spawn('python',['hill.py',req.body.encryptedText,2,key])

        cp.stdout.on('data',(data) => {
            console.log(`${data}`)
            const d = data.toString()
            res.send(JSON.stringify({decryptedData:d}))
        })
        
        cp.stderr.on('data',(data) => {
            console.error(`${data}`)
        })
    }
    if(req.body.algo != 'DH' && req.body.algo != 'Substitution' && req.body.algo != 'RSA'){
        const Securitykey = Buffer.from(obj.Securitykey.data)
        const initVector = Buffer.from(obj.initVector.data)
        

        textDecrypt(obj.encryptedText,obj.algo,Securitykey,initVector,res)
    }
   
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

    res.send(JSON.stringify({decryptedData:decryptedData}))
}

function RSA(t,res) {
    const key = new NodeRSA({b:512})

    const encrypted = key.encrypt(t,'base64')

   rsaKeys.push(key)

    res.send(JSON.stringify({encryptedText:encrypted}))
}

function RSAdec(text,res){
    const key = rsaKeys.pop()
    const decrypted = key.decrypt(text,'utf8')

    res.send(JSON.stringify({decryptedData:decrypted}))
}

const rsaKeys = []

function substitueCipher(text,res) {
    const all_letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()";
    
    /*
    Create a map to store the substitution for the given alphabet in the plain text based on the key
    */
    const dict1 = {};
    const key = 4;
    
    for (let i = 0; i < all_letters.length; i++) {
    dict1[all_letters[i]] = all_letters[(i + key) % all_letters.length];
    }
    
    const plain_txt = text;
    let cipher_txt = "";
    
    // loop to generate ciphertext
    for (let i = 0; i < plain_txt.length; i++) {
    const char = plain_txt[i];
    if (all_letters.includes(char)) {
    const temp = dict1[char];
    cipher_txt += temp;
    } else {
    cipher_txt += char;
    }
    }
    
    console.log("Cipher Text is: ", cipher_txt);

    res.send(JSON.stringify({encryptedText:cipher_txt}))

}


function substituePlain(text,res) {
    const cipher_txt = text
    const dict2 = {};

    const all_letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()";

    const key = 4;
 
    for (let i = 0; i < all_letters.length; i++) {
    dict2[all_letters[i]] = all_letters[(i - key + all_letters.length) % all_letters.length];
    }
    
    // loop to recover plain text
    let decrypt_txt = "";
    
    for (let i = 0; i < cipher_txt.length; i++) {
    const char = cipher_txt[i];
    if (all_letters.includes(char)) {
    const temp = dict2[char];
    decrypt_txt += temp;
    } else {
    decrypt_txt += char;
    }
    }
    
    console.log("Recovered plain text :", decrypt_txt);

    res.send(JSON.stringify({decryptedData:decrypt_txt}))
}

class DES {
    constructor(key) {
      // Initialize DES with key
      this.key = crypto.enc.Hex.parse(key);
    }
   
    encrypt(plaintext) {
      // Perform DES encryption on plaintext
      const encrypted = crypto.DES.encrypt(
        plaintext,
        this.key,
        { mode: crypto.mode.ECB }
      );
   
      // Return ciphertext as hex string
      return encrypted.ciphertext.toString();
    }
   
    decrypt(ciphertext) {
      // Parse ciphertext from hex string
      const ciphertextHex = crypto.enc.Hex.parse(ciphertext);
   
      // Perform DES decryption on ciphertext
      const decrypted = crypto.DES.decrypt(
        { ciphertext: ciphertextHex },
        this.key,
        { mode: crypto.mode.ECB }
      );
   
      // Return decrypted plaintext as UTF-8 string
      return decrypted.toString(crypto.enc.Utf8);
    }
  }


function desEncrypt(text){
    const key = "0123456789abcdef";

    const des = new DES(key)
    const cipher_txt = des.encrypt(text)

    return cipher_txt
}



