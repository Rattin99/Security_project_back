import sys

import string

chars = " " + string.punctuation + string.digits + string.ascii_letters
chars = list(chars)
key = chars.copy()



def decrypt(text):
    
    cipher_text = text
    
    plain_text = ""

    for letter in cipher_text:
        index = key.index(letter)
        plain_text += chars[index]
        
    return cipher_text



print(decrypt(sys.argv[1]))