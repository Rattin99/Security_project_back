# -*- coding: utf-8 -*-
"""RSA Text ENC DEC Final.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1goilARTWMfmw0XfhsMT-7CrfReUkciEu
"""

import random
import math

p = int(input("Enter a prime number p: "))
q = int(input("Enter another prime number q (not equal to p): "))

n = p * q
phi = (p - 1) * (q - 1)


def generate_e(phi):
    possible_e_values = []
    for i in range(2, phi):
        if math.gcd(i, phi) == 1:
            e = i
            possible_e_values.append(e)
    return random.choice(possible_e_values)

e = generate_e(phi)

def generate_d(e, phi):
    for i in range(2, phi):
        if (i * e) % phi == 1:
            d = i
            break
    return d

d = generate_d(e, phi)
print("d :", d)


plain_text = input("Enter a message to encrypt: ")

# Encrypt
msg = [ord(char) for char in plain_text]
e_msg = [pow(char, e, n) for char in msg]

print(f'Encrypted msg : {e_msg}')

# Decrypt
d_msg = [pow(char, d, n) for char in e_msg]
decrypted_text = ''.join(chr(char) for char in d_msg)

print(f'Decrypted msg : {decrypted_text}')