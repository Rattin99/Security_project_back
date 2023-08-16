import math
import random
from scipy.io import wavfile
import numpy as np
import matplotlib.pyplot as plt
import sounddevice as sd

fs, data = wavfile.read('utkarsh_audio.wav')
plt.plot(data)            # fs = sampling frequency = 44.1kHz
plt.title("Original Audio Plot")
data_1 = np.asarray(data, dtype = np.int32)

p1 = int(input("Enter a prime number: "))
p2 = int(input("Enter another prime number: "))

n = p1*p2
phi = (p1-1)*(p2-1)

def generate_e(phi):
    possible_e_values = []
    for i in range(2, phi):
        if math.gcd(i, phi) == 1:
            e = i
            possible_e_values.append(e)
    return random.choice(possible_e_values)

e = generate_e(phi)

def gcdExtended(E,t):
  a1,a2,b1,b2,d1,d2=1,0,0,1,t,E

  while d2!=1:

    # k
    k=(d1//d2)

    #a
    temp=a2
    a2=a1-(a2*k)
    a1=temp

    #b
    temp=b2
    b2=b1-(b2*k)
    b1=temp

    #d
    temp=d2
    d2=d1-(d2*k)
    d1=temp

    D=b2

  if D>t:
    D=D%t
  elif D<0:
    D=D+t

  return D


d=gcdExtended(e,phi)
print(d)

public_key = n,e
private_key = n,d

print("Public Key = ", public_key)
print("Private Key = ",private_key)

"""## Encrpytion of audio file"""

encrypted = (data**e)%n
plt.plot(encrypted)
plt.title("Encrypted Audio Plot")

encrypted = np.asarray(encrypted, dtype=np.int16)
wavfile.write('encrypted_rsa.wav', fs, encrypted)
#print("A file titled 'encrypted_rsa.wav' is generated which is the encrypted audio to be communicated")

"""## Loading and decrypting"""

fs, Data = wavfile.read('encrypted_rsa.wav')
plt.plot(Data)
plt.title("Encrypted Audio Plot")

"""## Decryption of data"""

decrypted = (Data**d)%n
plt.plot(decrypted)
plt.title('Decrypted Audio Plot')

