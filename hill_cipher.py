# -*- coding: utf-8 -*-
"""Hill_Cipher.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1yxpO1UejusenSBlIRxM3VjMsYurKIvcK
"""

import numpy as np


def convert(s, k):
    ara = []
    for i in range(0, len(s), k):
        row = []
        for j in range(i, min(i + k, len(s))):
            if s[j].isupper():  # Check if the character is uppercase
                row.append(ord(s[j]) - 65)  # Convert uppercase character to 0-25 range
            elif s[j].islower():  # Check if the character is lowercase
                row.append(ord(s[j]) - 97)  # Convert lowercase character to 0-25 range
            else:
                row.append(ord(s[j]) - 97)  # Use 0 for non-alphabet characters
        while len(row) < k:  # Add padding if needed
            row.append(0)
        ara.append(row)
    while len(ara) < k:  # Add additional rows if needed
        ara.append([0] * k)
    return ara


k = int(input('Enter key size: '))
key_string = str(input(f'Enter key string: '))
matrix = convert(key_string, k)
plain = str(input(f'Enter a plain text : '))


def canDec(matrix) :
  det = np.linalg.det(matrix)
  if det != 0 :
    return True
  else :
    return False

def process(matrix, k) :
  for i in range(k):
    for j in range(k):
      matrix[i][j] = (((matrix[i][j] % 26) + 26) % 26)
  return matrix

def mul(v, matrix, k):
    ans = []
    for i in range(k):
        x = 0
        for j in range(k):
            x += v[j] * matrix[j][i]
        x = ((x % 26) + 26) % 26
        ans.append(x)

    return ans


def encrypt(plain, k, matrix):
    cipher = ""
    plain_len = len(plain)

    # Add padding to the plain text if its length is not a multiple of k
    if plain_len % k != 0:
        padding_len = k - (plain_len % k)
        plain += 'x' * padding_len  # You can use any character for padding


    for i in range(0, len(plain), k):
        v = []
        for j in range(i, i + k):
            if plain[j].isupper():
                v.append(ord(plain[j]) - 65)
            elif plain[j].islower():
                v.append(ord(plain[j]) - 97)
            else:
                v.append(ord(plain[j]) - 97)  # Use 0 for non-alphabet characters
        temp = mul(v, matrix, k)
        for j in range(len(temp)):
            if temp[j] < 0:  # Handle negative values
                temp[j] = (temp[j] % 26) + 26
            elif temp[j] >= 26:  # Handle values greater than or equal to 26
                temp[j] %= 26
            if plain[i + j].isupper():
                cipher += chr(int(temp[j]) + 65)
            elif plain[i + j].islower():
                cipher += chr(int(temp[j]) + 97)
            else:
                cipher += chr(int(temp[j]) + 97)

    return cipher



def extended_gcd(a, b):
    if a == 0:
        return b, 0, 1
    gcd, x1, y1 = extended_gcd(b % a, a)
    x = y1 - (b // a) * x1
    y = x1
    return gcd, x, y

def inverse(a, m):
    gcd, x, y = extended_gcd(a, m)
    if gcd != 1:
        raise ValueError("Modular inverse does not exist")
    return (x % m + m) % m


def decrypt(cipher, k, matrix):
    ans = ""
    det = int(np.linalg.det(matrix))
    det = ((det%26) + 26) % 26
    det = inverse(det, 26)
    adj = np.linalg.inv(matrix) * np.linalg.det(matrix)
    adj = np.round(adj, decimals=3)
    adj = process(adj, k)
    for i in range(k):
        for j in range(k):
            adj[i][j] = (adj[i][j] * det) % 26
            adj[i][j]=int(adj[i][j])

    ans += encrypt(cipher, k, adj)
    ans = ans.rstrip('x')
    return ans

if not canDec(matrix) :
  print('Enter a valid key')
else :
  matrix = process(matrix, k)
  cipher = encrypt(plain, k, matrix)
  decrypted_text = decrypt(cipher, k, matrix)
  print(f"given plain: {plain}")
  print(f"encrypted cipher text: {cipher}")
  print(f"cypher text after decryption: {decrypted_text}")