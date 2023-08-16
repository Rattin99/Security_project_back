import sys

import string
import random




def encrypt(text):
    chars = " " + string.punctuation + string.digits + string.ascii_letters
    chars = list(chars)
    key = chars.copy()
    random.shuffle(key)
    
    plain_text = text
    
    cipher_text = ""

    for letter in plain_text:
        index = chars.index(letter)
        cipher_text += key[index]
        
    return cipher_text



print(encrypt(sys.argv[1]))